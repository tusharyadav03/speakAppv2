# 🚀 Deployment Guide - Render.com

This guide will help you deploy SpeakApp to Render.com for free.

## Prerequisites

- GitHub account with your code pushed
- Render.com account (free tier)

## Step-by-Step Deployment

### 1. Database Setup (Already Done ✅)

You've already created the PostgreSQL database. Here's what you have:

- Database Name: `speakapp_db`
- User: `speakapp_db_user`
- Port: 5432
- External URL: Available in Render dashboard

### 2. Fix Environment Variables

Go to your **speakApp** web service → **Environment** tab and update:

#### ✅ Add These Missing Variables:

```
DATABASE_URL
```

**Value**: Copy the **External Database URL** from your `speakapp-db` database Info tab
Example: `postgresql://speakapp_db_user:w7aqpJH1qIoJxyWJTTDDun1wKNpxavxJ@dpg-d60rh1nfte5873bd8fpg-a.oregon-postgres.render.com/speakapp_db`

```
NODE_ENV
```

**Value**: `production`

#### ⚠️ Fix These Existing Variables:

```
CORS_ORIGIN
```

**Current**: `https://speakappv2.onrender.com/`
**Change to**: `https://speakappv2.onrender.com` (remove trailing slash)

### 3. Configure Build & Start Commands

In your **speakApp** web service → **Settings** tab:

**Build Command**:

```bash
cd backend && npm install && cd ../frontend && npm install && npm run build
```

**Start Command**:

```bash
cd backend && npm start
```

**Root Directory**: Leave as `/` (root)

### 4. Deploy

After updating the environment variables and build commands:

1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for the build to complete (5-10 minutes)
3. Check the **Logs** tab for any errors

### 5. Verify Deployment

Once deployed, test these endpoints:

**Health Check**:

```
https://speakappv2.onrender.com/api/health
```

**API Info**:

```
https://speakappv2.onrender.com/api
```

**Frontend**:

```
https://speakappv2.onrender.com/
```

## Environment Variables Summary

Here's what your Environment tab should have:

| Key            | Value                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`     | `production`                                                                                                                       |
| `DATABASE_URL` | `postgresql://speakapp_db_user:w7aqpJH1qIoJxyWJTTDDun1wKNpxavxJ@dpg-d60rh1nfte5873bd8fpg-a.oregon-postgres.render.com/speakapp_db` |
| `JWT_SECRET`   | `a8f5f167f44f4964e6c998dee827110c` (your existing value)                                                                           |
| `CORS_ORIGIN`  | `https://speakappv2.onrender.com`                                                                                                  |
| `DB_HOST`      | `dpg-d60rh1nfte5873bd8fpg-a`                                                                                                       |
| `DB_NAME`      | `speakapp_db`                                                                                                                      |
| `DB_PASSWORD`  | `w7aqpJH1qIoJxyWJTTDDun1wKNpxavxJ`                                                                                                 |
| `DB_PORT`      | `5432`                                                                                                                             |
| `DB_USER`      | `speakapp_db_user`                                                                                                                 |

**Note**: The individual `DB_*` variables are optional if you have `DATABASE_URL` set.

## Troubleshooting

### Issue: "Cannot find module 'dotenv'"

**Solution**: Make sure build command includes `npm install` in backend directory

### Issue: "Database connection failed"

**Solution**:

1. Verify `DATABASE_URL` is set correctly
2. Check that `NODE_ENV=production` is set
3. Ensure database is in the same region as web service

### Issue: "CORS error"

**Solution**:

1. Remove trailing slash from `CORS_ORIGIN`
2. Make sure it matches your actual frontend URL

### Issue: Frontend shows "OFFLINE"

**Solution**:

1. Check backend logs for errors
2. Verify backend is running: `https://speakappv2.onrender.com/api/health`
3. Check frontend is pointing to correct backend URL

## Free Tier Limitations

- **Spin down after 15 minutes of inactivity**
  - First request after spin down takes 30-60 seconds
  - Subsequent requests are fast
- **750 hours/month** (enough for one service running 24/7)
- **Database**: 1GB storage, 97 connection limit

## Keeping Service Awake (Optional)

To prevent spin down, you can use a service like:

- **UptimeRobot** (free): Ping your app every 5 minutes
- **Cron-job.org** (free): Schedule health check requests

## Default Admin Login

After deployment, you can login with:

```
Email: admin@speakapp.io
Password: admin123
```

**⚠️ IMPORTANT**: Change this password immediately after first login!

## Next Steps

1. Update environment variables as listed above
2. Trigger a new deployment
3. Test the application
4. Change admin password
5. Share your live URL: `https://speakappv2.onrender.com`

## Support

If you encounter issues:

1. Check Render **Logs** tab for error messages
2. Verify all environment variables are set correctly
3. Ensure GitHub repository is up to date
4. Check Render Status page for platform issues
