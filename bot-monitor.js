const botTracker = require('./bot-tracker');

// Active monitors
const activeMonitors = new Map();

// Monitor a bot by polling updates
async function startMonitoring(botToken, botId) {
    if (activeMonitors.has(botId)) {
        console.log(`⚠️ Monitor already running for bot ${botId}`);
        return;
    }

    console.log(`🔍 Starting monitor for bot ${botId}`);

    const monitor = {
        botToken,
        botId,
        offset: 0,
        interval: null,
        lastCheck: Date.now()
    };

    // Poll updates every 3 seconds
    monitor.interval = setInterval(async () => {
        try {
            await pollUpdates(monitor);
        } catch (error) {
            console.error(`Error monitoring bot ${botId}:`, error.message);
        }
    }, 3000);

    activeMonitors.set(botId, monitor);
}

// Stop monitoring a bot
function stopMonitoring(botId) {
    const monitor = activeMonitors.get(botId);
    if (monitor) {
        clearInterval(monitor.interval);
        activeMonitors.delete(botId);
        console.log(`🛑 Stopped monitor for bot ${botId}`);
        return true;
    }
    return false;
}

// Poll for updates
async function pollUpdates(monitor) {
    const fetch = (await import('node-fetch')).default;
    
    try {
        const response = await fetch(
            `https://api.telegram.org/bot${monitor.botToken}/getUpdates?offset=${monitor.offset}&timeout=1`
        );
        const data = await response.json();

        if (!data.ok) {
            console.error(`Failed to get updates for bot ${monitor.botId}`);
            return;
        }

        const updates = data.result || [];

        for (const update of updates) {
            await processUpdate(monitor.botId, update);
            monitor.offset = update.update_id + 1;
        }

        monitor.lastCheck = Date.now();

    } catch (error) {
        console.error(`Error polling updates for bot ${monitor.botId}:`, error.message);
    }
}

// Process a single update
async function processUpdate(botId, update) {
    try {
        // Message received
        if (update.message) {
            const msg = update.message;
            
            // Track received message
            botTracker.logActivity(botId, 'message_received', {
                chatId: msg.chat.id.toString(),
                userId: msg.from.id.toString(),
                messageType: getMessageType(msg),
                contentPreview: getContentPreview(msg)
            });

            // If message is from the bot itself, it's a sent message
            // Note: Bot API doesn't show bot's own messages in getUpdates normally
        }

        // Callback query (button click)
        if (update.callback_query) {
            botTracker.logActivity(botId, 'command_used', {
                chatId: update.callback_query.message.chat.id.toString(),
                userId: update.callback_query.from.id.toString(),
                messageType: 'callback',
                contentPreview: update.callback_query.data
            });
        }

        // Channel post (bot posting to channel)
        if (update.channel_post) {
            const post = update.channel_post;
            
            botTracker.logActivity(botId, 'channel_post', {
                chatId: post.chat.id.toString(),
                userId: post.from?.id?.toString() || botId,
                messageType: getMessageType(post),
                contentPreview: getContentPreview(post),
                metadata: {
                    channelTitle: post.chat.title,
                    channelUsername: post.chat.username
                }
            });
        }

        // Edited channel post
        if (update.edited_channel_post) {
            const post = update.edited_channel_post;
            
            botTracker.logActivity(botId, 'channel_post', {
                chatId: post.chat.id.toString(),
                userId: post.from?.id?.toString() || botId,
                messageType: getMessageType(post),
                contentPreview: getContentPreview(post),
                metadata: {
                    channelTitle: post.chat.title,
                    channelUsername: post.chat.username,
                    edited: true
                }
            });
        }

    } catch (error) {
        console.error('Error processing update:', error);
    }
}

// Get message type
function getMessageType(msg) {
    if (msg.document) return 'document';
    if (msg.photo) return 'photo';
    if (msg.video) return 'video';
    if (msg.audio) return 'audio';
    if (msg.voice) return 'voice';
    if (msg.sticker) return 'sticker';
    if (msg.text) return 'text';
    return 'other';
}

// Get content preview
function getContentPreview(msg) {
    if (msg.text) return msg.text.substring(0, 100);
    if (msg.document) return msg.document.file_name || 'Document';
    if (msg.photo) return 'Photo';
    if (msg.video) return 'Video';
    if (msg.caption) return msg.caption.substring(0, 100);
    return 'Media';
}

// Get all active monitors
function getActiveMonitors() {
    return Array.from(activeMonitors.entries()).map(([botId, monitor]) => ({
        botId,
        lastCheck: monitor.lastCheck,
        offset: monitor.offset,
        isRunning: monitor.interval !== null
    }));
}

module.exports = {
    startMonitoring,
    stopMonitoring,
    getActiveMonitors
};
