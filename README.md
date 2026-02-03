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

## Quick Start (Kali Linux)

```bash
# 1. Extract and enter directory
unzip speakapp-prod.zip
cd speakapp-prod

# 2. Run automated setup
chmod +x scripts/*.sh
./scripts/setup.sh

# 3. Start server
./scripts/start.sh

# 4. Open browser
# http://localhost:3001
```

## Default Login

```
Email:    admin@speakapp.io
Password: admin123
```

## Documentation

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed installation instructions.

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO, PostgreSQL
- **Frontend**: React, Vite, TailwindCSS
- **Audio**: WebRTC peer-to-peer streaming

## License

MIT
