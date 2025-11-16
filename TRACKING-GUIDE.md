# 📊 Bot Activity Tracking System

## Overview
This system tracks all bot activity including messages, channel posts, and file uploads to provide accurate real-time statistics.

## 🎯 What It Tracks
- ✅ **Messages Sent** by the bot (exact count, not estimated)
- ✅ **Messages Received** from users
- ✅ **Channel Posts** made by the bot
- ✅ **Files Sent** (documents, photos, videos, etc.)
- ✅ **User Interactions** (unique users, commands)
- ✅ **All-Time Stats** (stored in SQLite database)

## 🚀 How to Integrate

### Step 1: API Endpoints Available

#### Track Single Activity
```http
POST http://localhost:3000/api/track/:botToken
Content-Type: application/json

{
  "activityType": "channel_post",
  "chatId": "-1001234567890",
  "userId": "123456789",
  "messageType": "document",
  "contentPreview": "myfile.pdf",
  "metadata": {
    "fileId": "BQACAgIAAxkBA...",
    "fileSize": 1048576,
    "fileName": "document.pdf"
  }
}
```

#### Track Multiple Activities (Batch)
```http
POST http://localhost:3000/api/track-batch/:botToken
Content-Type: application/json

{
  "activities": [
    {
      "activityType": "message_sent",
      "chatId": "123456789",
      "messageType": "text",
      "contentPreview": "Hello user!"
    },
    {
      "activityType": "channel_post",
      "chatId": "-1001234567890",
      "messageType": "document",
      "contentPreview": "file.pdf"
    }
  ]
}
```

### Step 2: Activity Types

| Activity Type | Description |
|--------------|-------------|
| `message_received` | Incoming message from user |
| `message_sent` | Outgoing message to user |
| `channel_post` | Post to a channel |
| `file_sent` | File/document/photo sent |
| `command_used` | Bot command executed |

### Step 3: Integration Methods

#### Option A: Wrap Telegram Methods (Recommended)
See `bot-integration-example.js` for complete examples of wrapping:
- `sendMessage()`
- `sendDocument()`
- `sendPhoto()`
- Channel posts

#### Option B: Manual Tracking
```javascript
// After sending a message
await bot.telegram.sendDocument(channelId, fileId);

// Track it
await axios.post(`http://localhost:3000/api/track/${BOT_TOKEN}`, {
    activityType: 'channel_post',
    chatId: channelId,
    messageType: 'document',
    contentPreview: 'filename.pdf'
});
```

#### Option C: Middleware (For All Messages)
```javascript
// Track all outgoing messages
bot.use(async (ctx, next) => {
    await next();
    
    // After message is sent
    if (ctx.sentMessage) {
        await trackActivity('message_sent', ctx);
    }
});
```

## 📈 View Statistics

Once integrated, your bot stats will show:
- **Exact message counts** (not estimated)
- **Channel post counts**
- **Files sent counts**
- **Real-time data** label instead of "estimated"
- **All-time statistics**

## 🗄️ Database

Data is stored in `bot-activity.db` (SQLite):
- Lightweight and fast
- No external database needed
- Automatic indexing for performance
- Keeps 90 days of history by default

## 🧹 Maintenance

Clean up old data (optional):
```javascript
const botTracker = require('./bot-tracker');

// Keep last 90 days only
botTracker.cleanupOldActivity(90);
```

## 🔧 Troubleshooting

### Stats Still Show Estimated Data
- Make sure your bot is sending tracking requests
- Check bot console for tracking errors
- Verify the tracker URL is correct
- Test with a simple request:
  ```bash
  curl -X POST http://localhost:3000/api/track/YOUR_BOT_TOKEN \
    -H "Content-Type: application/json" \
    -d '{"activityType":"test","chatId":"123"}'
  ```

### Database Not Created
- Ensure `better-sqlite3` is installed: `npm install better-sqlite3`
- Check file permissions in the project directory
- Look for errors in server console on startup

## 📊 Example Bot Code

See `bot-integration-example.js` for a complete working example with:
- Message tracking
- Channel post tracking
- File upload tracking
- Batch tracking for performance

## 🎯 Benefits

**Before Integration:**
- ~80 messages sent (estimated)
- 0 channel posts
- 0 files sent
- Limited to last 100 updates

**After Integration:**
- 1,247 messages sent (actual)
- 523 channel posts (actual)
- 156 files sent (actual)
- All-time statistics

## 🔐 Security Note

The tracking endpoint uses the bot token for identification. Keep your bot token secure and only send tracking requests from your bot's server.
