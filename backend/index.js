/**
 * SpeakApp API Server v1.0 - Production Ready
 * For deployment on Kali Linux / Debian / Ubuntu / Windows
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

require("dotenv").config();

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION (from environment or defaults)
// ═══════════════════════════════════════════════════════════════

const config = {
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'speakapp-secret-change-in-production',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'speakapp'
  },
  frontendPath: process.env.FRONTEND_PATH || path.join(__dirname, '../frontend/dist')
};

// ═══════════════════════════════════════════════════════════════
// DATABASE CONNECTION
// ═══════════════════════════════════════════════════════════════

// Database connection with proper SSL handling for local development
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes("render.com")
    ? { rejectUnauthorized: false }
    : false,
  // Fallback to individual config if DATABASE_URL is not set
  host: !process.env.DATABASE_URL ? config.db.host : undefined,
  port: !process.env.DATABASE_URL ? config.db.port : undefined,
  user: !process.env.DATABASE_URL ? config.db.user : undefined,
  password: !process.env.DATABASE_URL ? config.db.password : undefined,
  database: !process.env.DATABASE_URL ? config.db.database : undefined,
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('📦 Setting up database...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        company VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        room_code VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        host_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        attendees INTEGER DEFAULT 0,
        questions INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_events_code ON events(room_code);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Create admin user if not exists
    const admin = await client.query("SELECT 1 FROM users WHERE email='admin@speakapp.io'");
    if (admin.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await client.query(
        "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)",
        ['admin@speakapp.io', hash, 'Admin', 'superadmin']
      );
      console.log('✅ Admin user created: admin@speakapp.io / admin123');
    }

    console.log('✅ Database ready');
  } finally {
    client.release();
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPRESS + SOCKET.IO
// ═══════════════════════════════════════════════════════════════

const app = express();
app.set('trust proxy', 1);
const server = createServer(app);

// CORS configuration - allow both production and dev server
const corsOrigin = process.env.CORS_ORIGIN || "https://speakappv2.onrender.com";

const corsOptions = {
  origin: corsOrigin,
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
});

app.use(cors(corsOptions));
app.use(express.json());

// Serve frontend static files
if (fs.existsSync(config.frontendPath)) {
  app.use(express.static(config.frontendPath));
}

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY ROOM STATE
// ═══════════════════════════════════════════════════════════════

const rooms = new Map();

const genCode = () => {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array(4).fill(0).map(() => c[Math.floor(Math.random() * c.length)]).join('');
};

const getRoom = id => rooms.get(id?.toUpperCase());
const roomData = room => room ? {
  id: room.id,
  name: room.name,
  hostName: room.hostName,
  hostSocketId: room.hostSocketId,
  queue: room.queue,
  currentSpeaker: room.currentSpeaker,
  attendeeCount: room.attendees.size,
  transcript: room.transcript.slice(-30)
} : null;

// ═══════════════════════════════════════════════════════════════
// REST API ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "online",
    time: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => res.json({ app: 'SpeakApp', version: '1.0' }));

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    if (!await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, company } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, company) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email.toLowerCase(), hash, name, company || null]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: e.message });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const { userId } = jwt.verify(token, config.jwtSecret);
    const result = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ user: result.rows[0] });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Admin stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { role } = jwt.verify(token, config.jwtSecret);
    if (role !== 'admin' && role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' });

    const users = await pool.query('SELECT COUNT(*) FROM users');
    const events = await pool.query('SELECT * FROM events ORDER BY created_at DESC LIMIT 10');

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalEvents: events.rows.length,
      activeEvents: rooms.size,
      recentEvents: events.rows
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO HANDLERS
// ═══════════════════════════════════════════════════════════════

io.on('connection', socket => {
  console.log(`[+] ${socket.id}`);

  // Create event
  socket.on('create_event', async data => {
    let code = genCode();
    while (rooms.has(code)) code = genCode();

    const room = {
      id: code,
      name: data.name || 'Event',
      hostSocketId: socket.id,
      hostName: data.hostName || 'Host',
      queue: [],
      currentSpeaker: null,
      attendees: new Map(),
      transcript: []
    };

    rooms.set(code, room);
    socket.join(code);
    socket.roomId = code;
    socket.isHost = true;

    pool.query('INSERT INTO events (room_code, name, host_name) VALUES ($1, $2, $3)',
      [code, room.name, room.hostName]).catch(() => { });

    socket.emit('event_created', roomData(room));
    console.log(`[✓] Event: ${code}`);
  });

  // End event
  socket.on('end_event', roomId => {
    const room = getRoom(roomId);
    if (!room || socket.id !== room.hostSocketId) return;

    io.to(roomId.toUpperCase()).emit('event_ended');
    rooms.delete(roomId.toUpperCase());
    pool.query("UPDATE events SET status='ended', ended_at=NOW() WHERE room_code=$1", [roomId]).catch(() => { });
  });

  // Join room
  socket.on('join_room_attendee', ({ roomId, user }) => {
    const room = getRoom(roomId);
    if (!room) return socket.emit('error', 'Room not found');

    room.attendees.set(socket.id, { id: socket.id, name: user?.name || 'Guest' });
    socket.join(roomId.toUpperCase());
    socket.roomId = roomId.toUpperCase();

    socket.emit('room_data', roomData(room));
    io.to(room.hostSocketId).emit('attendee_joined', { count: room.attendees.size });
  });

  // Queue management
  socket.on('join_queue', ({ roomId, user }) => {
    const room = getRoom(roomId);
    if (!room || room.queue.some(q => q.id === socket.id)) return;
    room.queue.push({ id: socket.id, name: user?.name || 'Guest', question: '' });
    io.to(roomId.toUpperCase()).emit('room_data', roomData(room));
  });

  socket.on('leave_queue', roomId => {
    const room = getRoom(roomId);
    if (!room) return;
    room.queue = room.queue.filter(q => q.id !== socket.id);
    io.to(roomId.toUpperCase()).emit('room_data', roomData(room));
  });

  socket.on('submit_question', ({ roomId, text }) => {
    const room = getRoom(roomId);
    const entry = room?.queue.find(q => q.id === socket.id);
    if (entry) {
      entry.question = text;
      io.to(roomId.toUpperCase()).emit('room_data', roomData(room));
    }
  });

  // Floor control
  socket.on('grant_floor', ({ roomId, userId }) => {
    const room = getRoom(roomId);
    if (!room || room.currentSpeaker) return;
    const idx = room.queue.findIndex(q => q.id === userId);
    if (idx === -1) return;

    room.currentSpeaker = room.queue.splice(idx, 1)[0];
    io.to(roomId.toUpperCase()).emit('room_data', roomData(room));
    io.to(userId).emit('floor_granted');
  });

  socket.on('end_speech', roomId => {
    const room = getRoom(roomId);
    if (!room) return;
    room.currentSpeaker = null;
    io.to(roomId.toUpperCase()).emit('room_data', roomData(room));
  });

  // Follow-up
  socket.on('signal_followup', roomId => {
    const room = getRoom(roomId);
    if (room) io.to(room.hostSocketId).emit('followup_signal', { speakerName: room.currentSpeaker?.name });
  });

  socket.on('followup_response', ({ roomId, approved }) => {
    const room = getRoom(roomId);
    if (!room?.currentSpeaker) return;
    if (approved) io.to(room.currentSpeaker.id).emit('followup_approved');
    else {
      io.to(room.currentSpeaker.id).emit('followup_declined');
      room.currentSpeaker = null;
      io.to(roomId.toUpperCase()).emit('room_data', roomData(room));
    }
  });

  // Reactions
  socket.on('send_reaction', ({ roomId, emoji }) => {
    io.to(roomId?.toUpperCase()).emit('reaction_received', emoji);
  });

  // WebRTC signaling
  socket.on('webrtc_offer', ({ roomId, offer }) => {
    const room = getRoom(roomId);
    if (room) io.to(room.hostSocketId).emit('webrtc_offer', { from: socket.id, offer });
  });

  socket.on('webrtc_answer', ({ answer, to }) => {
    if (to) io.to(to).emit('webrtc_answer', { answer });
  });

  socket.on("webrtc_ice", ({ roomId, candidate, to }) => {
    if (to) {
      io.to(to).emit("webrtc_ice", { candidate });
      return;
    }

    const room = getRoom(roomId);
    if (!room) return;

    // if attendee sends ICE without "to", forward only to host
    io.to(room.hostSocketId).emit("webrtc_ice", { from: socket.id, candidate });
  });

  // Transcript
  socket.on('transcript_update', ({ roomId, text, speaker }) => {
    const room = getRoom(roomId);
    if (!room) return;
    const entry = { speaker: speaker || 'Speaker', text, timestamp: Date.now() };
    room.transcript.push(entry);
    if (room.transcript.length > 50) room.transcript.shift();
    io.to(roomId.toUpperCase()).emit('transcript_update', entry);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[-] ${socket.id}`);
    if (!socket.roomId) return;

    const room = getRoom(socket.roomId);
    if (!room) return;

    if (socket.isHost) {
      io.to(socket.roomId).emit('event_ended');
      rooms.delete(socket.roomId);
    } else {
      room.attendees.delete(socket.id);
      room.queue = room.queue.filter(q => q.id !== socket.id);
      if (room.currentSpeaker?.id === socket.id) room.currentSpeaker = null;
      io.to(socket.roomId).emit('room_data', roomData(room));
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// FRONTEND SPA FALLBACK
// ═══════════════════════════════════════════════════════════════

app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return res.status(404).json({ error: 'Not found' });
  }

  const indexPath = path.join(config.frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:50px">
      <h1>🎤 SpeakApp API Running</h1>
      <p>Port: ${config.port}</p>
      <p>Build frontend: <code>cd frontend && npm run build</code></p>
    </body></html>`);
  }
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

async function start() {
  try {
    await initDatabase();
  } catch (err) {
    console.error("⚠️ DB init failed, starting server anyway:", err.message);
  }

  server.listen(process.env.PORT || 3001, "0.0.0.0", () => {
    console.log(`🚀 Server listening on 0.0.0.0:${process.env.PORT || 3001}`);
  });
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    pool.end(() => process.exit(0));
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => {
    pool.end(() => process.exit(0));
  });
});

start();
