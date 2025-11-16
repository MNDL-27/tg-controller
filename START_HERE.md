# 🎯 START HERE - 2 Minute Setup

## What You're Getting
A **bot management dashboard** where you can:
- ✅ Login with Telegram
- ✅ Store all your bot tokens in one place
- ✅ Copy tokens with one click
- ✅ Manage multiple bots easily

---

## 🚀 Setup (2 Steps)

### Step 1: Create a Login Bot (1 minute)

1. Open Telegram and search: `@BotFather`
2. Send: `/newbot`
3. Follow prompts:
   - Bot name: `My Login Bot` (any name)
   - Username: `myloginbot` (must end in 'bot')

4. **You'll get**:
   ```
   Token: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   Username: myloginbot
   ```
   ⚠️ Save these!

### Step 2: Configure the App (30 seconds)

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your credentials
nano .env
```

Add your bot info:
```env
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_USERNAME=myloginbot
SESSION_SECRET=any-random-string-here
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`)

---

## ▶️ Run It

```bash
npm start
```

Open: **http://localhost:3000**

---

## ✅ That's It!

1. Click "Login with Telegram"
2. Authorize in Telegram
3. You'll see your bot dashboard
4. Add your other bot tokens to manage them!

---

## 📚 More Help

- **QUICK_SETUP.md** - Detailed setup instructions
- **BOT_DASHBOARD.md** - Dashboard features explained
- **WHY_BOT_TOKEN.md** - Why you need a bot for login

---

## 🤔 FAQ

**Q: Do I need a bot to login?**  
A: Yes, but only for the login system. You create ONE bot for authentication, then you can manage ALL your other bots in the dashboard!

**Q: Where do I get bot credentials?**  
A: From @BotFather on Telegram - send `/newbot`

**Q: Is my data safe?**  
A: Currently uses session storage (temporary). For production, add a database.

**Q: Can I add multiple bots?**  
A: Yes! Add unlimited bots to the dashboard after logging in.

---

**Need help? Check QUICK_SETUP.md for troubleshooting** 🆘
