# 📱 Telegram MTProto Client# 🤖 Simple Telegram Bot Dashboard# 📱 Telegram Dashboard



A complete **local Telegram client** that lets you log in with your own phone number and access your personal chats, groups, and channels. Built with **Telethon (MTProto)** and runs entirely on your laptop.



## ✨ FeaturesA clean, minimal Telegram bot dashboard that runs **100% locally** on your laptop. No frameworks, no external dependencies, no cloud hosting required.A **serverless, browser-first** web application for managing Telegram groups and channels. Built with Vercel Serverless Functions, Supabase PostgreSQL, and Next.js.



- 🔐 **Full MTProto authentication** - Log in with phone + verification code + 2FA

- 👤 **Your own Telegram account** - Access YOUR chats, not a bot's chats

- 💬 **View all conversations** - Private chats, groups, supergroups, channels## ✨ Features[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/tg-controller)

- 📨 **Send & receive messages** - Full message history and real-time sending

- 🎨 **Clean web interface** - Pure HTML/CSS/JavaScript frontend

- 🔒 **100% local** - All data stays on your machine

- 🌍 **Cross-platform** - Works on Windows, macOS, Linux- 📊 View bot information**🌐 No Installation Required** - Access from any browser on any device  



## 🛠️ Tech Stack- 💬 List all chats where your bot is a member**⚡ Serverless Architecture** - Scales automatically with zero server management  



- **Backend:** Python 3 + Telethon (MTProto) + aiohttp- 📤 Send messages to any chat**🚀 Deploy in Minutes** - One-click deployment to Vercel + Supabase  

- **Frontend:** Pure HTML/CSS/JavaScript (no frameworks)

- **Session:** Persistent local session file (survives restarts)- 📱 View chat details (members, admins, etc.)**🔒 Secure by Default** - HMAC-SHA256 verification, JWT tokens, Row Level Security



## 📋 Requirements- 🎨 Clean, responsive UI



- **Python 3.8+** (no other installations needed)- 🔒 Bot token stays secure on the server> **Note**: This is NOT a Telegram Mini App - it's a full web application accessible from any modern browser.

- **Telegram account** with phone number

- **API credentials** from [my.telegram.org](https://my.telegram.org/apps)



## 🚀 Quick Start## 🛠️ Tech Stack## 🌟 Features



### Step 1: Get Telegram API Credentials



1. Go to https://my.telegram.org/apps- **Backend**: Pure Node.js (built-in modules only)- **Telegram Login Widget Authentication** - Secure HMAC-SHA256 verification

2. Log in with your Telegram account

3. Create an application (any name/description)- **Frontend**: Pure HTML/CSS/JavaScript- **Group & Channel Management** - View all groups/channels where bot is member and user is admin

4. Copy your **API ID** and **API Hash**

- **Database**: None (in-memory storage)- **Real-time Data** - Fetch live information from Telegram API

### Step 2: Configure the App

- **Detailed Chat Information** - Member counts, admins, permissions, pinned messages

```bash

# Copy the example config## 📋 Requirements- **Bot Permission Tracking** - Monitor what your bot can do in each chat

cp config.json.example config.json

- **Webhook Support** - Automatic updates when bot is added/removed

# Edit config.json and add your credentials

{- Node.js 12 or higher (no packages needed!)- **Secure Backend** - JWT authentication, rate limiting, CORS protection

  "api_id": 12345678,

  "api_hash": "your_api_hash_here",- A Telegram bot token from [@BotFather](https://t.me/botfather)- **Modern UI** - Responsive Next.js frontend with beautiful design

  "port": 8080,

  "session_name": "tg_session"

}

```## 🚀 Quick Start## 🛠️ Tech Stack



### Step 3: Install Dependencies



```bash### 1. Get Your Bot Token**Backend (Serverless):**

cd backend

pip install -r requirements.txt- ⚡ Vercel Serverless Functions

```

1. Open Telegram and search for [@BotFather](https://t.me/botfather)- 📘 TypeScript

**Dependencies:**

- `telethon` - MTProto Telegram client library2. Send `/newbot` and follow the instructions- 🐘 Supabase PostgreSQL

- `aiohttp` - Async HTTP server

3. Copy the bot token (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)- 🤖 Telegram Bot API (axios)

### Step 4: Start the Backend

- 🔐 JWT authentication (jsonwebtoken)

```bash

python backend/main.py### 2. Configure the Backend- ✅ HMAC-SHA256 verification (crypto)

```



You should see:

Edit `backend/config.json` and add your bot token:**Frontend:**

```

🚀 Telegram MTProto Client - Starting...- ⚛️ Next.js 14 with App Router

==================================================

✓ Configuration loaded (API ID: 12345678)```json- 📘 TypeScript

✓ Telethon client initialized (not logged in yet)

{- 🎨 CSS Modules

🌐 Server running on http://localhost:8080

```  "botToken": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",- 🤖 Telegram Login Widget



### Step 5: Open the Frontend  "port": 3000,- 📡 Axios API client



Simply **open** `frontend/index.html` in your web browser:  "allowedOrigins": ["*"]



```}**Infrastructure:**

file:///path/to/tg-controller/frontend/index.html

``````- **Hosting**: Vercel (frontend + serverless functions)



Or double-click the file in your file explorer.- **Database**: Supabase (managed PostgreSQL)



### Step 6: Log In### 3. Start the Backend- **CDN**: Vercel Edge Network (global)



1. **Enter your phone number** (with country code, e.g., +1234567890)- **SSL**: Automatic HTTPS certificates

2. **Check your Telegram app** for the verification code

3. **Enter the 5-digit code**```bash- **Scaling**: Automatic with zero configuration

4. **If you have 2FA enabled**, enter your password

5. ✅ **You're in!**cd backend



## 📁 Project Structurenode main.js## 🚀 Quick Start



``````

tg-controller/

├── backend/### Option 1: One-Click Deploy (Recommended)

│   ├── main.py              # HTTP server (aiohttp)

│   ├── tele_client.py       # Telethon MTProto wrapperYou should see:

│   └── requirements.txt     # Python dependencies

├── frontend/**Deploy to production in ~15 minutes:**

│   └── index.html           # Pure HTML/CSS/JS interface

├── config.json              # Your API credentials (create this)```

├── config.json.example      # Template

└── README.md                # This file🤖 Telegram Bot Dashboard - Simple Backend1. **Click the deploy button** ⬇️

```

==========================================   

## 🔌 API Endpoints

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/tg-controller)

The backend exposes these REST endpoints:

✓ Configuration loaded

| Method | Endpoint | Description |

|--------|----------|-------------|✓ Telegram API initialized2. **Follow the setup wizard** - See [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) for detailed step-by-step instructions

| `POST` | `/api/auth/send-code` | Send verification code to phone |

| `POST` | `/api/auth/verify` | Verify code (and optional 2FA password) |✓ Bot connected: @YourBot (Your Bot Name)

| `GET` | `/api/me` | Get current user profile |

| `GET` | `/api/chats` | List all chats/groups/channels |3. **Configure your bot** - Create a Telegram bot with [@BotFather](https://t.me/BotFather)

| `GET` | `/api/chats/{id}/messages` | Get messages from a chat |

| `POST` | `/api/send-message` | Send a message |🚀 Server running on http://localhost:3000

| `POST` | `/api/auth/logout` | Log out and clear session |

```4. **Access your dashboard** - Open the Vercel URL in any browser

## 💡 Usage Tips



### Session Persistence

### 4. Open the Frontend**That's it!** No servers to manage, no installations required. 🎉

The app creates a **session file** (`tg_session.session`) after first login. This means:



- ✅ You stay logged in between restarts

- ✅ No need to verify your phone every timeSimply **double-click** on `index.html` or open it in your browser:### Option 2: Local Development (Optional)

- ⚠️ Keep this file **private** - it's like a password



### 2FA (Two-Factor Authentication)

```If you want to develop locally:

If you have 2FA enabled:

file:///path/to/tg-controller/index.html

1. Enter phone → code as usual

2. The app will detect 2FA and prompt for your password``````bash

3. Enter your 2FA password to complete login

# Clone repository

### Discovering Chats

That's it! 🎉git clone <your-repo-url>

The app shows ALL your Telegram chats:

cd tg-controller

- 👤 Private chats (direct messages)

- 👥 Groups and supergroups## 📁 Project Structure

- 📢 Channels you're subscribed to

# Backend setup

Click any chat to view messages and send new ones.

```cd backend

## 🔒 Security Notes

tg-controller/npm install

- ⚠️ **Never share your `api_hash`** - treat it like a password

- 🔐 **Never commit your `config.json`** - it contains your credentials├── backend/cp .env.example .env

- 💾 **Keep `tg_session.session` private** - it's your login session

- 🌐 **Only use on your local network** - the server has no authentication│   ├── main.js          # Server entry point# Edit .env with Supabase credentials



## 🐛 Troubleshooting│   ├── routes.js        # API route handlersnpm run dev



### "Cannot connect to backend"│   ├── telegram.js      # Telegram API wrapper



- Make sure `python backend/main.py` is running│   ├── utils.js         # Utility functions# Frontend setup (in another terminal)

- Check that nothing else is using port 8080

- Try accessing http://localhost:8080/health in your browser│   └── config.json      # Configuration (add your token here)cd frontend



### "api_id and api_hash not configured"├── index.html           # Frontend dashboardnpm install



- Edit `config.json` with your credentials from https://my.telegram.org/apps└── README.md            # This filecp .env.local.example .env.local

- Make sure the JSON syntax is valid (no trailing commas)

```# Edit .env.local with backend URL

### "Phone code expired"

npm run dev

- The Telegram verification code expires after a few minutes

- Request a new code and enter it quickly## 🔌 API Endpoints```



### "Session file is invalid"



- Delete `tg_session.session` and log in againThe backend exposes the following REST endpoints:See [QUICKSTART.md](QUICKSTART.md) for detailed local development instructions.

- This can happen if you changed API credentials



### "Module not found: telethon"

- `GET /health` - Health check## 🔐 Security Features

- Install dependencies: `pip install -r backend/requirements.txt`

- Make sure you're in a Python 3.8+ environment- `GET /api/bot/info` - Get bot information



## 🌍 Cross-Platform- `GET /api/chats` - List all known chats### Authentication Flow



Tested and working on:- `GET /api/chat/:chatId` - Get specific chat details



- ✅ **Windows** 10/11- `POST /api/send-message` - Send a message to a chat1. **User clicks "Login with Telegram"** - Telegram Login Widget appears

- ✅ **macOS** 10.14+

- ✅ **Linux** (Ubuntu, Debian, Fedora, etc.)2. **User authorizes** - Telegram sends auth data with HMAC-SHA256 signature



## 📦 Why No `package.json`?## 💡 Usage Tips3. **Backend verifies** - HMAC signature verified using bot token (server-side only)



This is a **Python** project, not Node.js! That's why:4. **JWT issued** - Backend generates JWT for subsequent API calls



- ✅ No `npm install` needed### Discover Chats5. **Token stored** - Frontend stores JWT in localStorage

- ✅ No webpack, babel, or build tools

- ✅ Just Python + Telethon6. **API calls** - All API requests include JWT in Authorization header

- ✅ Pure HTML frontend (no React/Vue/Angular)

The bot discovers chats through Telegram's `getUpdates` API. To populate your chat list:

## 🎯 Use Cases

### Security Measures

- 📊 Personal Telegram dashboard

- 🔍 Search your message history1. Add your bot to a group/channel

- 💾 Backup your chats locally

- 🤖 Automate personal Telegram tasks2. Or send a direct message to your bot✅ **HMAC-SHA256 Verification** - All Telegram login data is cryptographically verified  

- 📱 Access Telegram from any browser

- 🧪 Test Telegram bots from your account3. Click "Refresh" in the dashboard✅ **Bot Token Never Exposed** - Token stays on backend only  



## ⚖️ Legal & Terms✅ **JWT Authentication** - Secure session management  



- This app uses the official Telegram MTProto API### Send Messages✅ **Auth Date Expiry** - Login data expires after 24 hours  

- You must comply with [Telegram's Terms of Service](https://telegram.org/tos)

- Don't spam or abuse the API✅ **Rate Limiting** - Prevents abuse (100 requests per 15 minutes)  

- Respect rate limits and other users' privacy

1. Click "Message" next to any chat in the list (auto-fills the Chat ID)✅ **CORS Protection** - Restricts API access to frontend domain  

## 📝 License

2. Or manually enter a Chat ID✅ **Webhook Secret** - Verifies webhook requests are from Telegram  

MIT License - Use freely!

3. Type your message✅ **Admin Verification** - Users can only see groups where they're admins  

## 🤝 Contributing

4. Click "Send Message"

This is a minimal example project. Feel free to fork and extend!

### Important Security Notes

### Potential Enhancements:

## 🌍 Cross-Platform

- Add media support (photos, videos, files)

- Implement real-time message updates (polling/websockets)⚠️ **Never commit `.env` files**  

- Add chat search functionality

- Support for stickers and emojisWorks on:⚠️ **Change default JWT_SECRET and SESSION_SECRET**  

- Export chat history to JSON/CSV

- Desktop notifications for new messages⚠️ **Use HTTPS in production**  



---- ✅ Windows (7, 10, 11)⚠️ **Set up proper CORS in production**  



**Made with ❤️ using Telethon**- ✅ macOS (10.13+)⚠️ **Enable webhook secret for production**  



MTProto protocol. No Bot API. Full Telegram power. 🚀- ✅ Linux (any distro with Node.js)


## 📡 API Endpoints

## 🔒 Security Notes

### Authentication

- ⚠️ **Never commit your `config.json` with a real bot token**

- 🔐 The bot token stays on your local server (never sent to the browser)- `POST /api/auth/login` - Verify Telegram Login Widget data

- 🌐 CORS is enabled for local development (adjust in production)- `GET /api/auth/me` - Get current user info (requires JWT)

- 🚫 No authentication on the dashboard (only for local use)

### Chats

## 🐛 Troubleshooting

- `GET /api/chats` - Get all chats where user is admin (requires JWT)

### "Cannot connect to backend"- `GET /api/chats/:chatId` - Get detailed chat info (requires JWT)

- `POST /api/chats/:chatId/refresh` - Refresh chat data from Telegram (requires JWT)

- Make sure `node main.js` is running

- Check that the server is on port 3000### Webhook

- Verify no firewall is blocking localhost:3000

- `POST /api/webhook` - Receive Telegram updates (bot events)

### "Failed to connect to Telegram"

## 🗄️ Database Schema

- Check your bot token in `config.json`

- Verify your internet connection**Supabase PostgreSQL** with 4 tables:

- Make sure the token is valid (test with [@BotFather](https://t.me/botfather))

### users

### "No chats found"- Telegram user info from login

- Primary key: `id` (Telegram user ID)

- Add your bot to a group or send it a message first- Fields: `first_name`, `last_name`, `username`, `photo_url`, `auth_date`, `hash`

- The bot discovers chats through `getUpdates`

- Click "Refresh" after interacting with the bot### chats

- Group/channel information

## 📦 No Dependencies?- Primary key: `id` (Telegram chat ID)

- Fields: `type`, `title`, `username`, `description`, `member_count`, `photo_url`, `is_active`

That's right! This project uses **zero npm packages**. It only uses Node.js built-in modules:- Indexes: `idx_chats_is_active`



- `http` - Web server### chat_admins

- `https` - Telegram API requests- Administrator info for each chat

- `fs` - Read config file- Composite primary key: `(chat_id, user_id)`

- `path` - File path handling- Fields: `status`, `custom_title`, `is_anonymous`, permission flags

- `url` - URL parsing- Indexes: `idx_chat_admins_user_id`, `idx_chat_admins_status`

- Foreign keys: References `chats(id)` with CASCADE delete

## 🎯 Perfect For

### bot_permissions

- Quick bot testing- Bot's permissions in each chat

- Personal bot management- Primary key: `chat_id`

- Learning Node.js basics- Fields: Various `can_*` boolean flags

- No-setup local dashboard- Foreign key: References `chats(id)` with CASCADE delete

- Offline-first development

**Row Level Security (RLS)**: Enabled on all tables with appropriate policies

## 📝 License

## 🎨 Frontend Pages

MIT License - Use freely!

- **`/`** - Login page with Telegram Login Widget

## 🤝 Contributing- **`/dashboard`** - List of all groups/channels

- **`/chat/[chatId]`** - Detailed chat information

This is a minimal example project. Feel free to fork and customize for your needs!

## 🚢 Deployment

---

### Production Deployment (Recommended)

**Made with ❤️ for simplicity**

**Deploy to Vercel + Supabase in ~15 minutes:**

No frameworks. No build tools. No cloud. Just pure local power. 🚀

1. Follow the comprehensive guide: **[VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)**

2. Or use the one-click deploy button at the top of this README

**What you get:**
- ✅ Automatic SSL certificates (HTTPS)
- ✅ Global CDN (fast worldwide)
- ✅ Auto-scaling serverless functions
- ✅ Managed PostgreSQL database
- ✅ Free tier available (sufficient for most use cases)
- ✅ Zero server management

### Alternative Deployment Options

**Backend Alternatives:**
- Cloudflare Workers + D1 Database
- Netlify Functions + Supabase
- AWS Lambda + RDS/Aurora Serverless

**Database Alternatives:**
- Neon (PostgreSQL)
- PlanetScale (MySQL)
- Railway PostgreSQL

See [DEPLOYMENT.md](DEPLOYMENT.md) for alternative deployment methods.

## 🔧 Telegram Bot API Methods Used

- `getMe` - Get bot information
- `getChat` - Get chat details
- `getChatMemberCount` - Get member count
- `getChatAdministrators` - List all admins
- `getChatMember` - Get specific member info
- `exportChatInviteLink` - Get invite link (if bot is admin)
- `sendMessage` - Send messages to chat
- `setWebhook` - Configure webhook for updates

## 🎯 Use Cases

- **Community Managers** - Monitor all groups from one dashboard
- **Bot Developers** - Track bot permissions and admin status
- **Group Admins** - Quick overview of member counts and settings
- **Multi-group Management** - Manage multiple communities efficiently

## 🐛 Troubleshooting

### "Invalid authentication data"
- Check bot token is correct in backend `.env`
- Verify bot username matches in frontend `.env.local`
- Ensure BotFather domain settings include your domain

### "Chat not found"
- Make sure bot is added to the group
- User must be admin/creator in that group
- Try refreshing chat data

### "Failed to load chats"
- Check backend is running on correct port
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check browser console for CORS errors

### Telegram Login Widget not appearing
- Verify `NEXT_PUBLIC_BOT_USERNAME` is set correctly
- Check browser console for JavaScript errors
- Ensure BotFather domain settings are configured

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues, please open a GitHub issue or contact the maintainers.