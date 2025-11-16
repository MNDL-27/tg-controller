# 🚀 Quick Setup Guide

## You Need 2 Things to Get Started:

### 1️⃣ Bot Token (BOT_TOKEN)
### 2️⃣ Bot Username (BOT_USERNAME)

---

## 📝 How to Get Them

### Step 1: Create a Bot with @BotFather

1. Open Telegram and search for **@BotFather**
2. Start a chat and send: `/newbot`
3. Follow the prompts:
   - Enter bot name (e.g., "My Login Bot")
   - Enter bot username (must end in 'bot', e.g., "myloginbot")

4. **You'll receive**:
   ```
   Done! Congratulations on your new bot.
   
   Use this token to access the HTTP API:
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   
   Keep your token secure and store it safely!
   ```

5. **Save these**:
   - Token: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - Username: `myloginbot` (without @)

---

## ⚙️ Configure Your App

### Option 1: Using .env File (Recommended)

1. Create a `.env` file in the project root:
   ```bash
   nano .env
   ```

2. Add your bot credentials:
   ```env
   BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   BOT_USERNAME=myloginbot
   SESSION_SECRET=your-random-secret-key-here
   ```

3. Install dotenv:
   ```bash
   npm install dotenv
   ```

4. Update `server.js` (add at the top):
   ```javascript
   require('dotenv').config();
   ```

5. Start the server:
   ```bash
   npm start
   ```

### Option 2: Using Environment Variables

```bash
export BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
export BOT_USERNAME="myloginbot"
npm start
```

### Option 3: Inline (Quick Test)

```bash
BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" BOT_USERNAME="myloginbot" npm start
```

---

## ✅ Verify Setup

1. Start the server:
   ```bash
   npm start
   ```

2. You should see:
   ```
   ✅ Bot configured: myloginbot (123456789)
   🚀 TG Controller server running on http://localhost:3000
   ```

3. Open browser: `http://localhost:3000`

4. You should see the Telegram Login button (not an error)!

---

## 🔍 Troubleshooting

### Error: "Bot username not configured"

**Problem**: BOT_USERNAME not set  
**Solution**: Add `export BOT_USERNAME="yourbotname"` or add to .env file

### Error: "Please configure your BOT_TOKEN"

**Problem**: BOT_TOKEN not set  
**Solution**: Add `export BOT_TOKEN="your-token"` or add to .env file

### Widget Shows "Unknown bot"

**Problem**: Bot username doesn't exist  
**Solution**: Double-check the username with @BotFather (`/mybots`)

### Login Works But Can't Verify

**Problem**: BOT_TOKEN doesn't match the bot  
**Solution**: Make sure token belongs to the same bot as BOT_USERNAME

---

## 📋 Complete Example

```bash
# 1. Get your bot credentials from @BotFather
# Token: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
# Username: myloginbot

# 2. Create .env file
cat > .env << 'EOF'
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_USERNAME=myloginbot
SESSION_SECRET=my-super-secret-key-123
EOF

# 3. Install dependencies
npm install

# 4. Start server
npm start

# 5. Open browser
# Go to: http://localhost:3000
```

---

## 🎯 What Each Variable Does

| Variable | Purpose | Example |
|----------|---------|---------|
| `BOT_TOKEN` | Used to verify login authenticity (HMAC signature) | `123456789:ABC...` |
| `BOT_USERNAME` | Tells the widget which bot to use | `myloginbot` |
| `SESSION_SECRET` | Encrypts session cookies | `random-string-here` |

---

## 💡 Important Notes

1. **Keep BOT_TOKEN secret** - Never commit to Git or share publicly
2. **Bot must be active** - Don't delete the bot in @BotFather
3. **Username without @** - Use `myloginbot` not `@myloginbot`
4. **Token belongs to bot** - Make sure token and username match

---

## 🚀 Next Steps After Setup

Once configured:

1. ✅ Login with Telegram works
2. ✅ You can add your other bot tokens to the dashboard
3. ✅ Manage all your bots in one place

**The bot you create is ONLY for login authentication. You can then add any other bot tokens to manage them!**

---

## 🆘 Still Having Issues?

1. Check the server console for error messages
2. Verify bot exists: Send `/mybots` to @BotFather
3. Test bot token: `curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe`
4. Make sure you're using the username, not the bot name

---

**That's it! Two variables and you're ready to go!** 🎉
