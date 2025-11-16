# TG Controller - Telegram Login for Websites# TG Controller - Telegram User Authentication



Simple, secure user authentication for websites using Telegram's Login Widget.A complete authentication solution that allows users to login securely using their Telegram account. Works both as a standalone website and as a Telegram Web App.



## 🎯 What This Does## ✨ Features



Add **"Login with Telegram"** to your website. Users can login without passwords using their Telegram account!- 🔐 Secure user authentication via Telegram

- 👤 User profile display and session management

## ✨ Features- 📊 User dashboard after login

- 🎨 Beautiful, responsive UI

- 🔐 **Password-free authentication** - Users login with Telegram- 🔒 HMAC-based signature verification

- 🌐 **Works everywhere** - Any browser, desktop or mobile- 💾 Session persistence (7 days)

- 📊 **User dashboard** - Shows profile and session info- 🌐 Works on any website (not just inside Telegram)

- 🔒 **Secure** - HMAC signature verification

- 💾 **Sessions** - Users stay logged in for 7 days## 🚀 Two Integration Options

- 🎨 **Beautiful UI** - Modern, responsive design

### Option 1: Regular Website Login ⭐ **Recommended for Most Sites**

## 🚀 Quick Start

Users can visit your website directly and login with Telegram.

### 1. Install Dependencies

```bash**Perfect for:**

npm install- Public websites

```- SaaS applications

- E-commerce sites

### 2. Get Bot Token- Blogs & community platforms

1. Open Telegram and message [@BotFather](https://t.me/BotFather)- Any site that needs user authentication

2. Send `/newbot` and follow instructions

3. Copy the bot token**User Flow:**

1. User visits `yoursite.com`

### 3. Configure2. Clicks "Login with Telegram"

```bash3. Authenticates via Telegram

export BOT_TOKEN="your_bot_token_here"4. Returns to your site, logged in

export SESSION_SECRET="random_secret_key_here"

```👉 **[See Website Integration Guide](WEBSITE_INTEGRATION.md)**



Or create `.env` file:### Option 2: Telegram Web App

```bash

BOT_TOKEN=your_bot_token_hereUsers access your app only through a Telegram bot.

SESSION_SECRET=random_secret_key_here

```**Perfect for:**

- Apps that live inside Telegram

### 4. Start Server- Telegram-exclusive services

```bash- Bot companions

npm start

```**User Flow:**

1. User opens your Telegram bot

Visit `http://localhost:3000` and you're ready!2. Clicks "Open App"

3. App loads inside Telegram

## 🌐 How It Works4. User logs in



**User Flow:**Both options use the same backend and dashboard!

```

1. User visits your website## 📋 Prerequisites

2. Clicks "Login with Telegram" button

3. Telegram opens for authorization1. A Telegram bot (create one via [@BotFather](https://t.me/BotFather))

4. User approves2. Node.js installed (v14 or higher)

5. Returns to website logged in3. For website integration: Your own domain with HTTPS (or use ngrok for testing)

6. Access dashboard and features

```## Setup Instructions



**Technical Flow:**### Step 1: Create a Telegram Bot

```

Frontend → Telegram Widget → User Approval → Callback with Data1. Open Telegram and search for [@BotFather](https://t.me/BotFather)

       → Backend Verification (HMAC) → Session Created → Dashboard2. Send `/newbot` and follow the instructions to create a bot

```3. **Copy the bot token** (format: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

4. **Copy the bot username** (e.g., `MyAwesomeBot`)

## 📁 Project Structure

### Step 1b: Configure for Website Integration (Option 1)

```

tg-controller/If you want to use Telegram login on your regular website:

├── public/

│   ├── login.html         # Login page with Telegram widget```

│   └── dashboard.html     # User dashboard (protected)/setdomain in @BotFather

├── server.js              # Express server with auth logic→ Select your bot

├── package.json           # Dependencies→ Send your domain: yoursite.com

└── README.md             # This file```

```

### Step 1c: Configure for Web App (Option 2)

## 🔧 API Endpoints

If you want users to access through a Telegram bot:

### POST `/auth/telegram/verify`

Verifies Telegram login and creates session.```

/newapp in @BotFather

**Request:**→ Select your bot

```json→ Provide:

{   - Title: "TG Controller"

  "id": 123456789,   - Description: "Secure login system"

  "first_name": "John",   - Photo: (optional)

  "username": "johndoe",   - Web App URL: https://your-site.com/webapp

  "auth_date": 1234567890,```

  "hash": "abc123..."

}### Step 2: Install Dependencies

```

```bash

**Response:**npm install

```json```

{

  "success": true,### Step 3: Configure Application

  "user": {

    "id": 123456789,#### Backend Configuration

    "first_name": "John",Set your bot token as an environment variable:

    "username": "johndoe"

  }```bash

}export BOT_TOKEN="your_bot_token_here"

``````



### GET `/api/user`Or create a `.env` file:

Get current logged-in user.```bash

cp .env.example .env

### POST `/api/logout`# Edit .env and add your token

Logout and destroy session.```



### GET `/api/health`#### Frontend Configuration (for Website Integration)

Health check endpoint.Edit `public/login.html` and set your bot username:



## 📄 Routes```javascript

const BOT_USERNAME = 'MyAwesomeBot'; // Your bot username (without @)

- `/` - Home (redirects to `/dashboard` if logged in, else `/login`)```

- `/login` - Login page with Telegram widget

- `/dashboard` - User dashboard (requires authentication)### Step 4: Run the Server



## 🔐 Security```bash

npm start

- ✅ HMAC-SHA256 signature verification```

- ✅ Timestamp validation (24-hour window)

- ✅ Secure session cookies (httpOnly)For development with auto-reload:

- ✅ Protected routes

- ✅ No password storage```bash

npm run dev

## 🎨 Customization```



### Change Session Duration### Optional: Run Bot Script (Enhanced Experience)

Edit `server.js`:

```javascriptThe `bot.js` file provides an optional bot interface with commands and buttons:

maxAge: 7 * 24 * 60 * 60 * 1000 // Change 7 to your preferred days

``````bash

# Install the bot library

### Customize Dashboardnpm install node-telegram-bot-api

Edit `public/dashboard.html` - add your features and content.

# Set your Web App URL

### Style Changesexport WEB_APP_URL="https://your-app-url.com"

Modify CSS in `<style>` sections of HTML files.

# Run the bot (in a separate terminal)

### Add Databasenpm run bot

Extend `server.js` to save user data to your database after verification.```



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
