/**
 * TELEGRAM BOT TRACKING INTEGRATION GUIDE
 * ========================================
 * 
 * This file shows you how to integrate activity tracking into your Telegram bot.
 * Add this code to your bot to track all messages, channel posts, and file uploads.
 */

// Example using Telegraf (popular Telegram bot framework)
const { Telegraf } = require('telegraf');
const axios = require('axios');

// Your bot token and tracking server URL
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const TRACKER_URL = 'http://localhost:3000/api/track';

const bot = new Telegraf(BOT_TOKEN);

// Helper function to track activity
async function trackActivity(activityType, ctx, metadata = {}) {
    try {
        const data = {
            activityType: activityType,
            chatId: ctx.chat?.id?.toString(),
            userId: ctx.from?.id?.toString(),
            messageType: ctx.message?.text ? 'text' : ctx.message?.document ? 'document' : 'other',
            contentPreview: ctx.message?.text?.substring(0, 100) || metadata.preview || '',
            metadata: metadata
        };

        await axios.post(`${TRACKER_URL}/${BOT_TOKEN}`, data);
        console.log(`✅ Tracked: ${activityType}`);
    } catch (error) {
        console.error(`❌ Failed to track ${activityType}:`, error.message);
    }
}

// ==========================================
// TRACK INCOMING MESSAGES
// ==========================================
bot.on('message', async (ctx) => {
    await trackActivity('message_received', ctx);
    
    // Your bot logic here
    // ...
});

// ==========================================
// TRACK OUTGOING MESSAGES (WRAP sendMessage)
// ==========================================
const originalSendMessage = bot.telegram.sendMessage.bind(bot.telegram);
bot.telegram.sendMessage = async function(chatId, text, ...args) {
    const result = await originalSendMessage(chatId, text, ...args);
    
    // Track the sent message
    try {
        await axios.post(`${TRACKER_URL}/${BOT_TOKEN}`, {
            activityType: 'message_sent',
            chatId: chatId.toString(),
            messageType: 'text',
            contentPreview: text.substring(0, 100),
            metadata: { messageId: result.message_id }
        });
        console.log('✅ Tracked: message_sent');
    } catch (error) {
        console.error('❌ Failed to track sent message:', error.message);
    }
    
    return result;
};

// ==========================================
// TRACK CHANNEL POSTS
// ==========================================
bot.telegram.sendChannelPost = async function(channelId, text) {
    const result = await originalSendMessage(channelId, text);
    
    // Track channel post
    try {
        await axios.post(`${TRACKER_URL}/${BOT_TOKEN}`, {
            activityType: 'channel_post',
            chatId: channelId.toString(),
            messageType: 'text',
            contentPreview: text.substring(0, 100),
            metadata: { messageId: result.message_id }
        });
        console.log('✅ Tracked: channel_post');
    } catch (error) {
        console.error('❌ Failed to track channel post:', error.message);
    }
    
    return result;
};

// ==========================================
// TRACK FILE UPLOADS
// ==========================================
const originalSendDocument = bot.telegram.sendDocument.bind(bot.telegram);
bot.telegram.sendDocument = async function(chatId, document, ...args) {
    const result = await originalSendDocument(chatId, document, ...args);
    
    // Track file upload
    try {
        const isChannel = chatId.toString().startsWith('-100');
        await axios.post(`${TRACKER_URL}/${BOT_TOKEN}`, {
            activityType: isChannel ? 'channel_post' : 'file_sent',
            chatId: chatId.toString(),
            messageType: 'document',
            contentPreview: result.document?.file_name || 'File',
            metadata: {
                fileId: result.document?.file_id,
                fileSize: result.document?.file_size,
                fileName: result.document?.file_name
            }
        });
        console.log('✅ Tracked: file_sent');
    } catch (error) {
        console.error('❌ Failed to track file:', error.message);
    }
    
    return result;
};

// ==========================================
// TRACK PHOTOS
// ==========================================
const originalSendPhoto = bot.telegram.sendPhoto.bind(bot.telegram);
bot.telegram.sendPhoto = async function(chatId, photo, ...args) {
    const result = await originalSendPhoto(chatId, photo, ...args);
    
    try {
        const isChannel = chatId.toString().startsWith('-100');
        await axios.post(`${TRACKER_URL}/${BOT_TOKEN}`, {
            activityType: isChannel ? 'channel_post' : 'file_sent',
            chatId: chatId.toString(),
            messageType: 'photo',
            contentPreview: 'Photo',
            metadata: {
                fileId: result.photo[0]?.file_id
            }
        });
        console.log('✅ Tracked: photo_sent');
    } catch (error) {
        console.error('❌ Failed to track photo:', error.message);
    }
    
    return result;
};

bot.launch();

console.log('🤖 Bot started with tracking enabled!');

// ==========================================
// BATCH TRACKING (More Efficient)
// ==========================================
// If you're sending many messages, batch them for better performance:

let activityQueue = [];
const BATCH_SIZE = 10;

async function trackActivityBatched(activityType, ctx, metadata = {}) {
    activityQueue.push({
        activityType,
        chatId: ctx.chat?.id?.toString(),
        userId: ctx.from?.id?.toString(),
        messageType: ctx.message?.text ? 'text' : 'other',
        contentPreview: ctx.message?.text?.substring(0, 100) || '',
        metadata
    });

    if (activityQueue.length >= BATCH_SIZE) {
        await flushActivityQueue();
    }
}

async function flushActivityQueue() {
    if (activityQueue.length === 0) return;
    
    try {
        await axios.post(`${TRACKER_URL}-batch/${BOT_TOKEN}`, {
            activities: activityQueue
        });
        console.log(`✅ Batch tracked ${activityQueue.length} activities`);
        activityQueue = [];
    } catch (error) {
        console.error('❌ Failed to batch track:', error.message);
    }
}

// Flush queue every 30 seconds
setInterval(flushActivityQueue, 30000);

// Flush queue on process exit
process.on('SIGINT', async () => {
    await flushActivityQueue();
    process.exit();
});
