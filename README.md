# 🤖 TG Controller - Telegram Bot Management Dashboard# 🤖 TG Controller - Telegram Bot Management Dashboard



Manage all your Telegram bots from one beautiful web interface. Monitor activity, track statistics, view channels & groups, and more!Manage all your Telegram bots from one beautiful web interface. Monitor activity, track statistics, view channels & groups, and more!



## ✨ Features## ✨ Features



- 🔐 **Phone Number Authentication** - Login securely using your Telegram account- 🔐 **Phone Number Authentication** - Login securely using your Telegram account

- 🤖 **Multi-Bot Management** - View and manage all your bots from BotFather- 🤖 **Multi-Bot Management** - View and manage all your bots from BotFather

- 📊 **Real-time Statistics** - Track messages, users, commands, channel posts, and files- 📊 **Real-time Statistics** - Track messages, users, commands, channel posts, and files

- 🏢 **Channels & Groups** - See all channels and groups your bots are in- 🏢 **Channels & Groups** - See all channels and groups your bots are in

- 📡 **Automatic Monitoring** - Track bot activity without code changes- 📡 **Automatic Monitoring** - Track bot activity without code changes

- 🖼️ **Profile Photos** - Display bot and user avatars- �️ **Profile Photos** - Display bot and user avatars

- 🔄 **Auto-fetch Tokens** - Import bot tokens directly from BotFather- 🔄 **Auto-fetch Tokens** - Import bot tokens directly from BotFather

- ➕ **Create New Bots** - Create bots via BotFather from the web interface- ➕ **Create New Bots** - Create bots via BotFather from the web interface

- 💾 **Persistent Sessions** - Stay logged in for 7 days- � **Persistent Sessions** - Stay logged in for 7 days

- 🎨 **Beautiful UI** - Modern, responsive design- 🎨 **Beautiful UI** - Modern, responsive design



## 🚀 Quick Start### Option 1: Regular Website Login ⭐ **Recommended for Most Sites**



### 1. Clone and Install## 🚀 Quick Start



```bashUsers can visit your website directly and login with Telegram.

git clone https://github.com/MNDL-27/tg-controller.git

cd tg-controller### 1. Install Dependencies

npm install

``````bash**Perfect for:**



### 2. Get Telegram API Credentialsnpm install- Public websites



1. Go to [https://my.telegram.org](https://my.telegram.org)```- SaaS applications

2. Login with your phone number

3. Go to "API development tools"- E-commerce sites

4. Create a new application

5. Copy your **API_ID** and **API_HASH**### 2. Get Bot Token- Blogs & community platforms



### 3. Configure Environment1. Open Telegram and message [@BotFather](https://t.me/BotFather)- Any site that needs user authentication



Create a `.env` file:2. Send `/newbot` and follow instructions



```bash3. Copy the bot token**User Flow:**

cp .env.example .env

```1. User visits `yoursite.com`



Edit `.env` and add your credentials:### 3. Configure2. Clicks "Login with Telegram"



```bash```bash3. Authenticates via Telegram

API_ID=your_api_id_here

API_HASH=your_api_hash_hereexport BOT_TOKEN="your_bot_token_here"4. Returns to your site, logged in

PORT=3000

SESSION_SECRET=your-random-secret-key-hereexport SESSION_SECRET="random_secret_key_here"

```

```👉 **[See Website Integration Guide](WEBSITE_INTEGRATION.md)**

### 4. Start the Server



```bash

npm startOr create `.env` file:### Option 2: Telegram Web App

```

```bash

Visit **http://localhost:3000** and login with your phone number!

BOT_TOKEN=your_bot_token_hereUsers access your app only through a Telegram bot.

## 📱 How It Works

SESSION_SECRET=random_secret_key_here

### User Flow

```**Perfect for:**

1. **Login** → Enter phone number → Receive SMS code → Enter code (and 2FA if enabled)

2. **Dashboard** → View all your bots from BotFather automatically- Apps that live inside Telegram

3. **Bot Details** → Click any bot to see statistics, channels, groups, and activity

4. **Monitor** → Start automatic monitoring to track real-time activity### 4. Start Server- Telegram-exclusive services

5. **Manage** → Create new bots, view tokens, and manage all from one place

```bash- Bot companions

### Features in Detail

npm start

#### 📊 Bot Statistics

- Total users interacting with bot```**User Flow:**

- Messages received and sent

- Commands used1. User opens your Telegram bot

- Channel posts made

- Files sentVisit `http://localhost:3000` and you're ready!2. Clicks "Open App"

- Real-time activity tracking

3. App loads inside Telegram

#### 🏢 Channels & Groups

- See all channels your bot is admin/member of## 🌐 How It Works4. User logs in

- View all groups bot is in

- Direct links to public channels/groups

- Chat IDs and types

**User Flow:**Both options use the same backend and dashboard!

#### 📡 Automatic Monitoring

- No code changes needed to your bots```

- Monitors via Telegram's getUpdates API

- Tracks channel posts, messages, files automatically1. User visits your website## 📋 Prerequisites

- Works with any bot including third-party bots like TelDrive

- Start/stop monitoring from web interface2. Clicks "Login with Telegram" button



#### 🤖 Bot Management3. Telegram opens for authorization1. A Telegram bot (create one via [@BotFather](https://t.me/BotFather))

- Auto-fetch all bots from BotFather

- Import tokens automatically4. User approves2. Node.js installed (v14 or higher)

- Create new bots via BotFather

- View and copy bot tokens5. Returns to website logged in3. For website integration: Your own domain with HTTPS (or use ngrok for testing)

- See bot profile photos

6. Access dashboard and features

## 📁 Project Structure

```## Setup Instructions

```

tg-controller/

├── public/

│   ├── login-phone.html      # Phone authentication page**Technical Flow:**### Step 1: Create a Telegram Bot

│   ├── bots.html              # Bot management dashboard

│   └── bot-details.html       # Individual bot statistics & info```

├── server.js                  # Express server with all logic

├── bot-tracker.js             # SQLite activity tracking systemFrontend → Telegram Widget → User Approval → Callback with Data1. Open Telegram and search for [@BotFather](https://t.me/BotFather)

├── bot-monitor.js             # Automatic monitoring system

├── sessions/                  # Session storage (auto-created)       → Backend Verification (HMAC) → Session Created → Dashboard2. Send `/newbot` and follow the instructions to create a bot

├── bot-activity.db           # SQLite database (auto-created)

├── package.json              # Dependencies```3. **Copy the bot token** (format: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

├── .env                      # Your configuration (create this)

└── README.md                 # This file4. **Copy the bot username** (e.g., `MyAwesomeBot`)

```

## 📁 Project Structure

## 🔧 API Endpoints

### Step 1b: Configure for Website Integration (Option 1)

### Authentication

- `POST /auth/phone/send-code` - Send verification code to phone```

- `POST /auth/phone/verify-code` - Verify SMS code

- `POST /auth/phone/verify-password` - Verify 2FA passwordtg-controller/If you want to use Telegram login on your regular website:

- `POST /auth/logout` - Logout user

- `GET /api/user` - Get current user info├── public/



### Bot Management│   ├── login.html         # Login page with Telegram widget```

- `GET /api/bots` - Get all user's bots

- `GET /api/bots/fetch` - Fetch bots from BotFather│   └── dashboard.html     # User dashboard (protected)/setdomain in @BotFather

- `POST /api/bots` - Add bot manually

- `DELETE /api/bots/:botId` - Delete bot├── server.js              # Express server with auth logic→ Select your bot

- `POST /api/bots/create` - Create new bot via BotFather

├── package.json           # Dependencies→ Send your domain: yoursite.com

### Bot Details

- `GET /api/bots/:botId` - Get bot details└── README.md             # This file```

- `GET /api/bots/:botId/stats` - Get bot statistics

- `GET /api/bots/:botId/chats` - Get channels & groups bot is in```



### Monitoring### Step 1c: Configure for Web App (Option 2)

- `POST /api/bots/:botId/monitor/start` - Start monitoring bot

- `POST /api/bots/:botId/monitor/stop` - Stop monitoring bot## 🔧 API Endpoints

- `GET /api/monitor/status` - Get all monitoring status

If you want users to access through a Telegram bot:

### Activity Tracking

- `POST /api/track/:botToken` - Log single activity### POST `/auth/telegram/verify`

- `POST /api/track-batch/:botToken` - Log multiple activities

Verifies Telegram login and creates session.```

## 🗄️ Database

/newapp in @BotFather

The app uses **SQLite** (via better-sqlite3) to store bot activity:

**Request:**→ Select your bot

- **bot_activity** table - Stores all tracked activity (messages, channel posts, files, etc.)

- **bot_stats_cache** table - Cached aggregated statistics```json→ Provide:

- Automatic cleanup of old data (90 days by default)

- Indexed for performance{   - Title: "TG Controller"

- No external database setup needed

  "id": 123456789,   - Description: "Secure login system"

## 🔒 Security

  "first_name": "John",   - Photo: (optional)

- Phone number authentication via Telegram API (GramJS)

- Secure session storage with 7-day expiry  "username": "johndoe",   - Web App URL: https://your-site.com/webapp

- HMAC verification for Telegram data

- Session-based authentication  "auth_date": 1234567890,```

- No passwords stored

- Environment variables for sensitive data  "hash": "abc123..."



## 🐛 Troubleshooting}### Step 2: Install Dependencies



### Can't login with phone number```

- Make sure API_ID and API_HASH are correct from my.telegram.org

- Check that your phone number starts with country code (e.g., +1234567890)```bash

- Verify SMS code within a few minutes

**Response:**npm install

### Bots not showing up

- Click "🔄 Fetch Bots from BotFather" button```json```

- Make sure you own bots in BotFather

- Check that bots have tokens available{



### Monitoring not working  "success": true,### Step 3: Configure Application

- Click "📡 Start Monitoring" button on bot details page

- Bot must have valid token  "user": {

- Bot needs to have recent activity to track

- Check server console for errors    "id": 123456789,#### Backend Configuration



### Sessions not persisting    "first_name": "John",Set your bot token as an environment variable:

- Make sure SESSION_SECRET is set in .env

- Check that ./sessions/ directory exists and is writable    "username": "johndoe"

- Verify cookies are enabled in browser

  }```bash

## 🚀 Deployment

}export BOT_TOKEN="your_bot_token_here"

### Environment Variables Required

``````

```bash

API_ID=your_api_id              # From my.telegram.org

API_HASH=your_api_hash          # From my.telegram.org

SESSION_SECRET=random_secret    # Generate a random string### GET `/api/user`Or create a `.env` file:

PORT=3000                       # Optional, defaults to 3000

```Get current logged-in user.```bash



### Deploy to VPScp .env.example .env



```bash### POST `/api/logout`# Edit .env and add your token

# Install dependencies

npm installLogout and destroy session.```



# Install PM2 for process management

npm install -g pm2

### GET `/api/health`#### Frontend Configuration (for Website Integration)

# Start server

pm2 start server.js --name tg-controllerHealth check endpoint.Edit `public/login.html` and set your bot username:



# Make it start on system boot

pm2 startup

pm2 save## 📄 Routes```javascript

```

const BOT_USERNAME = 'MyAwesomeBot'; // Your bot username (without @)

### Deploy to Heroku

- `/` - Home (redirects to `/dashboard` if logged in, else `/login`)```

```bash

heroku create your-app-name- `/login` - Login page with Telegram widget

heroku config:set API_ID="your_api_id"

heroku config:set API_HASH="your_api_hash"- `/dashboard` - User dashboard (requires authentication)### Step 4: Run the Server

heroku config:set SESSION_SECRET="random_secret"

git push heroku main

```

## 🔐 Security```bash

### Deploy to Railway

npm start

```bash

railway init- ✅ HMAC-SHA256 signature verification```

railway add

railway variables --set API_ID="your_api_id"- ✅ Timestamp validation (24-hour window)

railway variables --set API_HASH="your_api_hash"

railway variables --set SESSION_SECRET="random_secret"- ✅ Secure session cookies (httpOnly)For development with auto-reload:

railway up

```- ✅ Protected routes



## 📦 Dependencies- ✅ No password storage```bash



- **express** - Web frameworknpm run dev

- **telegram** (GramJS) - Telegram MTProto client

- **express-session** - Session management## 🎨 Customization```

- **session-file-store** - File-based session storage

- **better-sqlite3** - SQLite database

- **node-fetch** - HTTP requests for bot monitoring

- **dotenv** - Environment variables### Change Session Duration### Optional: Run Bot Script (Enhanced Experience)



## 🎯 Use CasesEdit `server.js`:



- Monitor multiple Telegram bots from one dashboard```javascriptThe `bot.js` file provides an optional bot interface with commands and buttons:

- Track bot analytics (users, messages, commands)

- Manage bot tokens and credentialsmaxAge: 7 * 24 * 60 * 60 * 1000 // Change 7 to your preferred days

- View which channels/groups your bots are in

- Create new bots quickly via BotFather``````bash

- Monitor third-party bots (like TelDrive) without code access

- Track channel posts and file uploads# Install the bot library



## 📚 Resources### Customize Dashboardnpm install node-telegram-bot-api



- [Telegram API Documentation](https://core.telegram.org/api)Edit `public/dashboard.html` - add your features and content.

- [GramJS Documentation](https://gram.js.org/)

- [Telegram Bot API](https://core.telegram.org/bots/api)# Set your Web App URL

- [BotFather Commands](https://core.telegram.org/bots#6-botfather)

### Style Changesexport WEB_APP_URL="https://your-app-url.com"

## 🤝 Contributing

Modify CSS in `<style>` sections of HTML files.

Feel free to open issues or submit pull requests!

# Run the bot (in a separate terminal)

## 📝 License

### Add Databasenpm run bot

MIT

Extend `server.js` to save user data to your database after verification.```

---



**Made with ❤️ for Telegram bot developers**

## 🚀 DeploymentThis provides users with:

- `/start` command with "Open App" button

### Environment Variables- `/help` command for assistance

```bash- `/about` command for information

BOT_TOKEN=your_bot_token- Confirmation messages after login

SESSION_SECRET=random_secret_key

PORT=3000**Note:** The bot script is optional. The web app works without it, but the bot enhances the user experience.

NODE_ENV=production

```The server will start on `http://localhost:3000`



### Deploy to Heroku### Step 5: Expose to Internet (for testing)

```bash

heroku create your-appSince Telegram Web Apps need to be accessible via HTTPS, you can use ngrok for testing:

heroku config:set BOT_TOKEN="your_token"

heroku config:set SESSION_SECRET="random_key"```bash

git push heroku main# Install ngrok if you haven't

```# Then run:

ngrok http 3000

### Deploy to Railway```

```bash

railway initCopy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and provide it to BotFather when creating your Web App.

railway add

railway variables --set BOT_TOKEN="your_token"### Step 6: Access Your Application

railway variables --set SESSION_SECRET="random_key"

railway up#### For Website Integration (Option 1):

```

1. Visit `http://localhost:3000` in any browser

**Important:** Your website MUST be accessible via HTTPS in production!2. You'll see "Login with Telegram" button

3. Click to authenticate

## 💡 Use Cases4. You'll be redirected to your dashboard



- Membership websites#### For Telegram Web App (Option 2):

- User dashboards

- SaaS applications1. Open your bot in Telegram

- Community platforms2. Click the button/menu to open the Web App

- Admin panels3. The app opens with your Telegram identity

- E-commerce sites4. Click "Login with Telegram"

- Any site needing user authentication!5. Redirected to your dashboard



## 🐛 Troubleshooting**Both options lead to the same dashboard!**



### "Hash mismatch" error## How It Works

- Verify `BOT_TOKEN` is correct

- Check no extra spaces in token### User Flow



### Login button doesn't work1. **User opens bot** → Clicks "Open App" button in Telegram

- Ensure bot token is set2. **App loads** → Displays login page with user info from Telegram

- Check browser console for errors3. **User clicks "Login"** → App sends auth data to backend

- Verify Telegram is installed or accessible4. **Backend verifies** → Checks HMAC signature and timestamp

5. **Session created** → User is logged in with a secure session

### Session not persisting6. **Dashboard access** → User can now use the full application

- Set `SESSION_SECRET` environment variable7. **Stay logged in** → Session persists for 7 days

- Check cookies are enabled

- Verify `secure` flag settings match environment### Technical Flow



### Can't access from mobile**Frontend** (`public/index.html` - Login page):

- Ensure website is accessible from mobile network- Loads Telegram Web App SDK

- Use HTTPS in production- Retrieves user data from `window.Telegram.WebApp.initDataUnsafe`

- Test with ngrok for local development- Displays user information

- Sends init data to backend for verification

## 📚 Resources- Redirects to dashboard on success



- [Telegram Login Widget Docs](https://core.telegram.org/widgets/login)**Dashboard** (`public/dashboard.html`):

- [Telegram Bot API](https://core.telegram.org/bots/api)- Protected route (requires authentication)

- [Express.js Session](https://github.com/expressjs/session)- Displays user profile and features

- Allows logout

## 📝 License

**Backend** (`server.js`):

MIT- Receives init data from frontend

- Verifies data using HMAC-SHA256 signature

## 🤝 Contributing- Checks data freshness (not older than 24 hours)

- Creates user session on successful verification

Feel free to customize and extend this project for your needs!- Protects dashboard route

- Handles logout

---

## Security

**Made with ❤️ for easy Telegram authentication**

The app implements Telegram's recommended security practices:

- ✅ HMAC signature verification
- ✅ Timestamp validation
- ✅ Secure hash comparison
- ✅ No client-side token storage

## API Endpoints

### POST `/api/verify`

Authenticates user and creates session.

**Request:**
```json
{
  "initData": "query_id=xxx&user=%7B%22id%22%3A..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": 123456789,
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "language_code": "en"
  },
  "authDate": 1699999999,
  "message": "Login successful"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Hash mismatch"
}
```

### GET `/api/user`

Get current logged-in user information.

**Response:**
```json
{
  "loggedIn": true,
  "user": {
    "id": 123456789,
    "first_name": "John",
    "username": "johndoe"
  }
}
```

### POST `/api/logout`

Logout current user and destroy session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET `/api/health`

Check server health and configuration.

**Response:**
```json
{
  "status": "ok",
  "botConfigured": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Routes

- `/` - Login page (must be opened from Telegram)
- `/dashboard` - User dashboard (protected, requires login)
- `/info` - Information page for developers

## Deployment

### Deploy to Heroku

```bash
heroku create your-app-name
heroku config:set BOT_TOKEN="your_bot_token_here"
git push heroku main
```

### Deploy to Railway

```bash
railway init
railway add
railway variables --set BOT_TOKEN="your_bot_token_here"
railway up
```

### Deploy to Vercel/Netlify

For serverless deployment, you'll need to adapt the Express server to serverless functions.

## Environment Variables

- `BOT_TOKEN` - Your Telegram bot token (required)
- `SESSION_SECRET` - Secret key for session encryption (required in production)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (set to 'production' for secure cookies)

## Troubleshooting

### "Hash mismatch" error
- Make sure your BOT_TOKEN is correct
- Verify the bot token matches the bot that hosts the Web App

### "Data is too old" error
- Check server time is synchronized
- The init data is only valid for 24 hours

### Web App doesn't load
- Ensure URL is HTTPS (except localhost)
- Verify the URL is set correctly in BotFather
- Check that you're opening from the Telegram app, not a browser

### Can't access from browser
- This is normal! The app MUST be opened from Telegram
- Visit `/info` page for developer information
- Use ngrok to test locally with Telegram

### Session expires quickly
- Check SESSION_SECRET is set
- Ensure cookies are enabled
- Session lasts 7 days by default

## Resources

- [Telegram Web Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Web App Examples](https://github.com/telegram-mini-apps)

## License

MIT
