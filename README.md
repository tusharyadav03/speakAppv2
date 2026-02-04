# 🎤 SpeakApp

Real-time conference Q&A platform with WebRTC audio streaming.

## Features

- ✅ Real-time WebRTC audio streaming
- ✅ Live question queue management
- ✅ QR code room joining
- ✅ Emoji reactions (🔥 ❤️ 👍 👏 🎉 💡)
- ✅ Follow-up request system
- ✅ Live transcript display
- ✅ Admin dashboard
- ✅ Mobile-responsive UI

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/windows/)
- **Git** - [Download](https://git-scm.com/download/win)

## Quick Start (Windows)

### 1. Clone the Repository

```bash
git clone https://github.com/tusharyadav03/speakAppv2.git
cd speakAppv2
```

### 2. Setup PostgreSQL Database

Open **pgAdmin** or **psql** and create a database:

```sql
CREATE DATABASE speakapp;
```

Create a user (optional):

```sql
CREATE USER speakapp_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE speakapp TO speakapp_user;
```

### 3. Configure Backend

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/speakapp
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
```

**Note:** Replace `your_password` with your PostgreSQL password.

### 4. Configure Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_BACKEND_URL=http://localhost:3001
```

### 5. Start the Application

**Option A: Run Both Services Separately**

Open two terminal windows:

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

**Option B: Run from Root (if you have concurrently installed)**

From the project root:

```bash
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Default Login Credentials

```
Email:    admin@speakapp.io
Password: admin123
```

## Project Structure

````
├── 📁 backend
│   ├── 📄 index.js
│   ├── ⚙️ package-lock.json
│   └── ⚙️ package.json
├── 📁 frontend
│   ├── 📁 src
│   │   ├── 📁 styles
│   │   │   └── 🎨 index.css
│   │   ├── 📄 App.jsx
│   │   └── 📄 main.jsx
│   ├── 🌐 index.html
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── 📄 postcss.config.js
│   ├── 📄 tailwind.config.js
│   └── 📄 vite.config.js
├── ⚙️ .gitignore
├── 📝 README.md
└── ⚙️ package-lock.json
```

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO, PostgreSQL
- **Frontend**: React, Vite, TailwindCSS, Lucide Icons
- **Audio**: WebRTC peer-to-peer streaming
- **Authentication**: JWT (JSON Web Tokens)

## Development

### Backend Development

```bash
cd backend
npm run dev    # Runs with nodemon for auto-reload
````

### Frontend Development

```bash
cd frontend
npm run dev    # Runs Vite dev server with HMR
```

### Build for Production

**Frontend:**

```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## Troubleshooting

### PostgreSQL Connection Issues

1. Ensure PostgreSQL service is running:
   - Open **Services** (Win + R → `services.msc`)
   - Find **postgresql-x64-XX** and ensure it's running

2. Check your connection string in `backend/.env`

3. Verify PostgreSQL is listening on port 5432

### Port Already in Use

If ports 3001 or 5173 are already in use:

**Backend:** Change `PORT` in `backend/.env`

**Frontend:** Change port in `frontend/vite.config.js`:

```js
export default {
  server: {
    port: 5174, // Change to any available port
  },
};
```

### WebRTC Audio Issues

- Ensure you're using **HTTPS** in production (WebRTC requires secure context)
- Allow microphone permissions in your browser
- Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/tusharyadav03/speakAppv2/issues).
