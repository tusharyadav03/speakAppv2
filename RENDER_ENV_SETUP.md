# 🔧 Render.com Environment Variables Setup

## Current Status ✅

You have these variables set correctly:

- ✅ CORS_ORIGIN: `https://speakappv2.onrender.com`
- ✅ DB_HOST: `dpg-d60rh1nfte5873bd8fpg-a`
- ✅ DB_NAME: `speakapp_db`
- ✅ DB_PASSWORD: `w7aqpJH1qIoJxyWJTTDDun1wKNpxavxJ`
- ✅ DB_PORT: `5432`
- ✅ DB_USER: `speakapp_db_user`
- ✅ JWT_SECRET: `a8f5f167f44f4964e6c998dee827110c`

## ⚠️ MISSING - Add These Two Variables:

### 1. DATABASE_URL

**Click "Add Environment Variable"**

**Key:** `DATABASE_URL`

**Value:**

```
postgresql://speakapp_db_user:w7aqpJH1qIoJxyWJTTDDun1wKNpxavxJ@dpg-d60rh1nfte5873bd8fpg-a.oregon-postgres.render.com/speakapp_db
```

**How to get this:**

1. Go to your `speakapp-db` database in Render dashboard
2. Click on the database name
3. Go to "Info" tab
4. Copy the "External Database URL"
5. Paste it as the value for DATABASE_URL

### 2. NODE_ENV

**Click "Add Environment Variable"**

**Key:** `NODE_ENV`

**Value:** `production`

## 🚀 After Adding These Variables:

1. **Save** the environment variables
2. Go to **Manual Deploy** → **Deploy latest commit**
3. Wait for deployment to complete (5-10 minutes)
4. Check **Logs** tab to monitor progress

## 📝 Build & Start Commands

Make sure these are set in **Settings** tab:

**Build Command:**

```bash
cd backend && npm install && cd ../frontend && npm install && npm run build
```

**Start Command:**

```bash
cd backend && npm start
```

## ✅ Verification

After deployment completes, test:

1. **API Health Check:**

   ```
   https://speakappv2.onrender.com/api/health
   ```

   Should return: `{"status":"ok","db":"connected","rooms":0}`

2. **Frontend:**

   ```
   https://speakappv2.onrender.com/
   ```

   Should show your SpeakApp homepage

3. **Login:**
   - Email: `admin@speakapp.io`
   - Password: `admin123`

## 🐛 Troubleshooting

If deployment fails, check **Logs** tab for:

- ✅ "npm install" completed successfully
- ✅ "npm run build" completed successfully
- ✅ "📦 Setting up database..." appears
- ✅ "✅ Database ready" appears
- ✅ "🚀 Server listening on 0.0.0.0:10000" appears

Common issues:

- **"Cannot find module 'dotenv'"** → Build command not running npm install
- **"Database connection failed"** → DATABASE_URL not set or incorrect
- **"CORS error"** → CORS_ORIGIN doesn't match frontend URL
