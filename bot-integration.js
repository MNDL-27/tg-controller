const TelegramBot = require('node-telegram-bot-api');
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.error('❌ Please set BOT_TOKEN environment variable');
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Telegram Bot started...');
console.log('📝 This bot allows two-way communication between your website and users\n');

// Store user connections (in production, use a database)
const connectedUsers = new Map(); // websiteUserId -> { telegramId, chatId, username }

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const username = msg.from.username;
    const firstName = msg.from.first_name;
    
    console.log(`✅ User started bot: ${firstName} (@${username}) - ID: ${telegramId}`);
    
    bot.sendMessage(chatId, 
        `👋 Welcome ${firstName}!\n\n` +
        `🔗 To connect this bot with your website account:\n` +
        `1. Login to the website\n` +
        `2. Go to Settings\n` +
        `3. Click "Connect Telegram Bot"\n` +
        `4. Enter this code: \`${telegramId}\`\n\n` +
        `Once connected, you'll receive notifications here!`,
        { parse_mode: 'Markdown' }
    );
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId,
        `📖 *Available Commands:*\n\n` +
        `/start - Start the bot and get connection instructions\n` +
        `/help - Show this help message\n` +
        `/status - Check connection status\n` +
        `/disconnect - Disconnect from website\n\n` +
        `For more info, visit the website!`,
        { parse_mode: 'Markdown' }
    );
});

// Handle /status command
bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    
    // Check if user is connected (you'd check your database here)
    const isConnected = Array.from(connectedUsers.values()).some(
        user => user.telegramId === telegramId
    );
    
    if (isConnected) {
        bot.sendMessage(chatId, '✅ Your Telegram account is connected to the website!');
    } else {
        bot.sendMessage(chatId, '❌ Not connected. Send /start to get connection instructions.');
    }
});

// API endpoint simulation - call this from your website
// In production, expose this via your Express server
function connectUserAccount(websiteUserId, telegramId) {
    // This would be called from your website after user enters the code
    const user = Array.from(connectedUsers.entries())
        .find(([_, data]) => data.telegramId === telegramId);
    
    if (user) {
        const [existingId, userData] = user;
        connectedUsers.delete(existingId);
    }
    
    // Get chat ID (you'd need to store this when user sends /start)
    // For now, we'll need to handle this in /start command
    connectedUsers.set(websiteUserId, {
        telegramId: telegramId,
        chatId: null, // Will be set when user sends /start
        connectedAt: new Date()
    });
    
    console.log(`🔗 Connected website user ${websiteUserId} with Telegram ID ${telegramId}`);
    return true;
}

// Send notification to a specific user
function sendNotification(websiteUserId, message) {
    const user = connectedUsers.get(websiteUserId);
    
    if (user && user.chatId) {
        bot.sendMessage(user.chatId, message)
            .then(() => {
                console.log(`📤 Sent notification to user ${websiteUserId}`);
            })
            .catch(err => {
                console.error(`❌ Failed to send notification:`, err.message);
            });
        return true;
    }
    
    console.log(`⚠️  User ${websiteUserId} not connected or no chat ID`);
    return false;
}

// Broadcast message to all connected users
function broadcastMessage(message) {
    let sent = 0;
    let failed = 0;
    
    connectedUsers.forEach((user, userId) => {
        if (user.chatId) {
            bot.sendMessage(user.chatId, message)
                .then(() => sent++)
                .catch(() => failed++);
        }
    });
    
    console.log(`📢 Broadcast sent to ${sent} users, ${failed} failed`);
}

// Handle any text message (not a command)
bot.on('message', (msg) => {
    // Only process if not a command
    if (!msg.text || msg.text.startsWith('/')) return;
    
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const text = msg.text;
    
    // Find if this user is connected
    const connectedUser = Array.from(connectedUsers.entries())
        .find(([_, data]) => data.telegramId === telegramId);
    
    if (connectedUser) {
        const [websiteUserId, _] = connectedUser;
        console.log(`💬 Message from user ${websiteUserId}: ${text}`);
        
        // Here you could forward this to your website, save to database, etc.
        bot.sendMessage(chatId, 
            `✅ Message received! We'll get back to you soon.\n\n` +
            `You can also check your account on the website.`
        );
    } else {
        bot.sendMessage(chatId,
            `👋 Hi! To use this bot, please connect it with your website account first.\n\n` +
            `Send /start for instructions!`
        );
    }
});

// Handle errors
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.code);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down bot...');
    bot.stopPolling();
    process.exit(0);
});

// Export functions for use in your Express server
module.exports = {
    connectUserAccount,
    sendNotification,
    broadcastMessage,
    bot
};
