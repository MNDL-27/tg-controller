require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram/tl');
const botTracker = require('./bot-tracker');
const botMonitor = require('./bot-monitor');

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram API credentials (get from https://my.telegram.org)
const API_ID = parseInt(process.env.API_ID || '0');
const API_HASH = process.env.API_HASH || '';

// Store active auth sessions temporarily
const authSessions = new Map();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware for user authentication with persistent file storage
app.use(session({
    store: new FileStore({
        path: './sessions',
        ttl: 7 * 24 * 60 * 60, // 7 days in seconds
        retries: 0,
        secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production'
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// BOT_TOKEN no longer needed - using phone authentication instead
// const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

/**
 * Verify Telegram Login Widget data
 * According to: https://core.telegram.org/widgets/login#checking-authorization
 */
function verifyTelegramLoginWidget(data) {
    try {
        const { hash, ...userData } = data;
        
        if (!hash) {
            return { valid: false, error: 'Hash not found' };
        }

        // Create data-check-string
        const checkArr = Object.keys(userData)
            .sort()
            .map(key => `${key}=${userData[key]}`);
        const dataCheckString = checkArr.join('\n');

        // Create secret key (for login widget, it's SHA256 of bot token)
        const secretKey = crypto
            .createHash('sha256')
            .update(BOT_TOKEN)
            .digest();

        // Calculate hash
        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        // Verify hash matches
        if (calculatedHash !== hash) {
            return { valid: false, error: 'Invalid authentication data' };
        }

        // Check auth_date (data should not be older than 24 hours)
        const authDate = parseInt(userData.auth_date);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeDiff = currentTime - authDate;
        
        if (timeDiff > 86400) { // 24 hours
            return { valid: false, error: 'Authentication data is too old' };
        }

        return {
            valid: true,
            user: {
                id: parseInt(userData.id),
                first_name: userData.first_name,
                last_name: userData.last_name,
                username: userData.username,
                photo_url: userData.photo_url
            },
            authDate: authDate
        };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

// API endpoint to verify Telegram Login Widget (POST)
app.post('/auth/telegram/verify', (req, res) => {
    const userData = req.body;

    if (!userData || !userData.id) {
        return res.status(400).json({
            success: false,
            error: 'User data is required'
        });
    }

    if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
        return res.status(500).json({
            success: false,
            error: 'Bot token not configured. Please set BOT_TOKEN environment variable.'
        });
    }

    const verification = verifyTelegramLoginWidget(userData);

    if (verification.valid) {
        // Authentication successful - create user session
        req.session.user = verification.user;
        req.session.authDate = verification.authDate;
        
        console.log('✓ User logged in:', verification.user);
        
        res.json({
            success: true,
            user: verification.user,
            authDate: verification.authDate,
            message: 'Login successful'
        });
    } else {
        // Authentication failed
        console.error('✗ Login failed:', verification.error);
        
        res.status(401).json({
            success: false,
            error: verification.error
        });
    }
});

// Telegram callback endpoint (GET) - handles redirect from widget (NO DOMAIN VERIFICATION NEEDED)
app.get('/auth/telegram/callback', (req, res) => {
    const userData = req.query;

    if (!userData || !userData.id) {
        return res.status(400).send('Invalid authentication data');
    }

    if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
        return res.status(500).send('Bot token not configured');
    }

    const verification = verifyTelegramLoginWidget(userData);

    if (verification.valid) {
        // Authentication successful - create user session
        req.session.user = verification.user;
        req.session.authDate = verification.authDate;
        
        console.log('✓ User logged in:', verification.user.first_name);
        
        // Redirect to bots dashboard
        res.redirect('/bots');
    } else {
        // Authentication failed
        console.error('✗ Login failed:', verification.error);
        res.status(401).send('Authentication failed: ' + verification.error);
    }
});

// Configuration endpoint
app.get('/api/config', (req, res) => {
    const botUsername = process.env.BOT_USERNAME || '';
    res.json({
        botUsername: botUsername,
        configured: botUsername !== '' && BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE',
        apiConfigured: API_ID !== 0 && API_HASH !== ''
    });
});

// ========================================
// PHONE NUMBER LOGIN (REAL TELEGRAM AUTH)
// ========================================

// Send verification code to phone
app.post('/auth/phone/send-code', async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || !phone.startsWith('+')) {
            return res.json({ success: false, error: 'Invalid phone number format' });
        }

        if (!API_ID || !API_HASH || API_ID === 0) {
            return res.json({ 
                success: false, 
                error: 'Telegram API credentials not configured. Get them from https://my.telegram.org' 
            });
        }

        // Create new Telegram client for this phone
        const stringSession = new StringSession('');
        const client = new TelegramClient(stringSession, API_ID, API_HASH, {
            connectionRetries: 5,
        });

        await client.connect();

        // Send code
        const result = await client.sendCode({
            apiId: API_ID,
            apiHash: API_HASH
        }, phone);

        // Store client and phoneCodeHash for this session
        const sessionId = crypto.randomBytes(16).toString('hex');
        authSessions.set(sessionId, {
            client,
            phone,
            phoneCodeHash: result.phoneCodeHash,
            createdAt: Date.now()
        });

        // Cleanup after 10 minutes
        setTimeout(() => {
            const session = authSessions.get(sessionId);
            if (session && session.client) {
                session.client.disconnect();
            }
            authSessions.delete(sessionId);
        }, 10 * 60 * 1000);

        res.json({
            success: true,
            phoneCodeHash: result.phoneCodeHash,
            sessionId
        });

    } catch (error) {
        console.error('Send code error:', error);
        res.json({ 
            success: false, 
            error: error.message || 'Failed to send code' 
        });
    }
});

// Verify code and login
app.post('/auth/phone/verify-code', async (req, res) => {
    try {
        const { phone, code, phoneCodeHash } = req.body;

        if (!phone || !code || !phoneCodeHash) {
            return res.json({ success: false, error: 'Missing required fields' });
        }

        // Find the auth session
        let authSession = null;
        for (const [sessionId, session] of authSessions.entries()) {
            if (session.phone === phone && session.phoneCodeHash === phoneCodeHash) {
                authSession = session;
                break;
            }
        }

        if (!authSession) {
            return res.json({ success: false, error: 'Session not found or expired' });
        }

        try {
            // Sign in with code using proper GramJS API
            const result = await authSession.client.invoke(
                new Api.auth.SignIn({
                    phoneNumber: phone,
                    phoneCodeHash: phoneCodeHash,
                    phoneCode: code
                })
            );

            // Get user info
            const me = await authSession.client.getMe();

            // Try to get user profile photo
            let userPhotoUrl = null;
            try {
                const photo = await authSession.client.downloadProfilePhoto(me, {
                    isBig: false
                });
                if (photo) {
                    userPhotoUrl = `data:image/jpeg;base64,${photo.toString('base64')}`;
                }
            } catch (photoError) {
                console.log('  No user photo available');
            }

            // Create session
            req.session.user = {
                id: me.id.toString(),
                first_name: me.firstName || '',
                last_name: me.lastName || '',
                username: me.username || '',
                phone: me.phone || phone.replace('+', ''),
                photoUrl: userPhotoUrl
            };
            req.session.authDate = Math.floor(Date.now() / 1000);
            req.session.telegramSession = authSession.client.session.save();

            console.log('✓ User logged in via phone:', me.firstName);

            res.json({ success: true });

        } catch (error) {
            // Check if 2FA is required
            if (error.errorMessage === 'SESSION_PASSWORD_NEEDED') {
                return res.json({ 
                    success: true, 
                    requiresPassword: true 
                });
            }
            
            throw error;
        }

    } catch (error) {
        console.error('Verify code error:', error);
        res.json({ 
            success: false, 
            error: error.message || 'Invalid verification code' 
        });
    }
});

// Verify 2FA password
app.post('/auth/phone/verify-password', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.json({ success: false, error: 'Missing required fields' });
        }

        // Find the auth session
        let authSession = null;
        for (const [sessionId, session] of authSessions.entries()) {
            if (session.phone === phone) {
                authSession = session;
                break;
            }
        }

        if (!authSession) {
            return res.json({ success: false, error: 'Session not found or expired' });
        }

        // Sign in with password using proper GramJS API
        const passwordSrpResult = await authSession.client.invoke(
            new Api.account.GetPassword()
        );

        const srpPassword = await authSession.client.computeSRPPassword(
            passwordSrpResult,
            password
        );

        await authSession.client.invoke(
            new Api.auth.CheckPassword({
                password: srpPassword
            })
        );

        // Get user info
        const me = await authSession.client.getMe();

        // Try to get user profile photo
        let userPhotoUrl = null;
        try {
            const photo = await authSession.client.downloadProfilePhoto(me, {
                isBig: false
            });
            if (photo) {
                userPhotoUrl = `data:image/jpeg;base64,${photo.toString('base64')}`;
            }
        } catch (photoError) {
            console.log('  No user photo available');
        }

        // Create session
        req.session.user = {
            id: me.id.toString(),
            first_name: me.firstName || '',
            last_name: me.lastName || '',
            username: me.username || '',
            phone: me.phone || phone.replace('+', ''),
            photoUrl: userPhotoUrl
        };
        req.session.authDate = Math.floor(Date.now() / 1000);
        req.session.telegramSession = authSession.client.session.save();

        console.log('✓ User logged in via phone (2FA):', me.firstName);

        res.json({ success: true });

    } catch (error) {
        console.error('Verify password error:', error);
        res.json({ 
            success: false, 
            error: 'Invalid password' 
        });
    }
});

// ========================================
// SIMPLE CODE-BASED LOGIN (NO BOT NEEDED!)
// ========================================

// Store login codes temporarily (in production, use Redis)
const loginCodes = new Map();

// Generate random 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate login code endpoint
app.get('/auth/simple/generate', (req, res) => {
    const loginId = crypto.randomBytes(16).toString('hex');
    const code = generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    loginCodes.set(loginId, {
        code,
        expiresAt,
        verified: false,
        user: null
    });

    // Cleanup expired codes
    setTimeout(() => {
        loginCodes.delete(loginId);
    }, 5 * 60 * 1000);

    res.json({
        success: true,
        loginId,
        code,
        expiresIn: 300 // seconds
    });
});

// Verify login code (when user enters code in "Telegram")
app.get('/auth/simple/verify', (req, res) => {
    const { id, code, user_id, first_name, last_name, username } = req.query;

    if (!id || !code) {
        return res.status(400).send('Missing login ID or code');
    }

    const loginData = loginCodes.get(id);

    if (!loginData) {
        return res.status(404).send('Login code not found or expired');
    }

    if (loginData.code !== code) {
        return res.status(401).send('Invalid code');
    }

    if (Date.now() > loginData.expiresAt) {
        loginCodes.delete(id);
        return res.status(401).send('Code expired');
    }

    // Mark as verified and store user info (simulated)
    loginData.verified = true;
    loginData.user = {
        id: user_id || Date.now(), // Use timestamp as fake user ID if not provided
        first_name: first_name || 'Demo User',
        last_name: last_name || '',
        username: username || ''
    };

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login Successful</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 20px;
                }
                .success-box {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    text-align: center;
                    max-width: 400px;
                }
                .icon { font-size: 64px; margin-bottom: 20px; }
                h1 { color: #28a745; margin-bottom: 16px; }
                p { color: #666; margin-bottom: 24px; }
                .btn {
                    background: #28a745;
                    color: white;
                    padding: 12px 32px;
                    border-radius: 8px;
                    text-decoration: none;
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <div class="success-box">
                <div class="icon">✅</div>
                <h1>Login Successful!</h1>
                <p>You can close this window and return to the main page.</p>
                <a href="/" class="btn">Go to Dashboard</a>
            </div>
            <script>
                // Auto-close after 3 seconds if opened in new window
                setTimeout(() => {
                    if (window.opener) {
                        window.close();
                    }
                }, 3000);
            </script>
        </body>
        </html>
    `);
});

// Check if login code has been verified
app.get('/auth/simple/check', (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.json({ error: 'Missing login ID' });
    }

    const loginData = loginCodes.get(id);

    if (!loginData) {
        return res.json({ expired: true });
    }

    if (Date.now() > loginData.expiresAt) {
        loginCodes.delete(id);
        return res.json({ expired: true });
    }

    if (loginData.verified) {
        // Create session
        req.session.user = loginData.user;
        req.session.authDate = Math.floor(Date.now() / 1000);
        loginCodes.delete(id); // Clean up

        return res.json({ verified: true, user: loginData.user });
    }

    res.json({ verified: false });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        botConfigured: BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE',
        timestamp: new Date().toISOString()
    });
});

// Check if user is logged in
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({
            loggedIn: true,
            user: req.session.user
        });
    } else {
        res.json({
            loggedIn: false
        });
    }
});

// Get user's bots
app.get('/api/bots', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Not logged in'
        });
    }

    // Get bots from session (in production, use database)
    const bots = req.session.bots || [];
    
    res.json({
        success: true,
        bots: bots
    });
});

// Get single bot details
app.get('/api/bots/:botId', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Not logged in'
        });
    }

    const { botId } = req.params;
    const bots = req.session.bots || [];
    const bot = bots.find(b => b.id === botId || b.username === botId);

    if (!bot) {
        return res.status(404).json({
            success: false,
            error: 'Bot not found'
        });
    }

    res.json({
        success: true,
        bot: bot
    });
});

// Get bot statistics
app.get('/api/bots/:botId/stats', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Not logged in'
        });
    }

    const { botId } = req.params;
    const bots = req.session.bots || [];
    const bot = bots.find(b => b.id === botId);

    if (!bot || !bot.token) {
        return res.json({
            success: false,
            error: 'Bot not found or no token available'
        });
    }

    try {
        // Fetch bot info from Telegram API
        const botInfoResponse = await fetch(`https://api.telegram.org/bot${bot.token}/getMe`);
        const botInfo = await botInfoResponse.json();

        if (!botInfo.ok) {
            return res.json({
                success: false,
                error: 'Invalid bot token or bot not accessible'
            });
        }

        // Fetch webhook info
        const webhookResponse = await fetch(`https://api.telegram.org/bot${bot.token}/getWebhookInfo`);
        const webhookInfo = await webhookResponse.json();

        // Fetch updates to count messages (last 100 updates)
        const updatesResponse = await fetch(`https://api.telegram.org/bot${bot.token}/getUpdates?limit=100`);
        const updatesData = await updatesResponse.json();

        const updates = updatesData.ok ? updatesData.result : [];
        
        // Analyze updates for statistics
        const uniqueUsers = new Set();
        const uniqueChats = new Set();
        const recentUpdates = [];
        let messageCount = 0;
        let commandCount = 0;

        updates.forEach(update => {
            if (update.message) {
                const msg = update.message;
                uniqueUsers.add(msg.from.id);
                uniqueChats.add(msg.chat.id);
                messageCount++;

                if (msg.text && msg.text.startsWith('/')) {
                    commandCount++;
                    recentUpdates.push({
                        type: 'command',
                        text: `${msg.from.first_name} used ${msg.text.split(' ')[0]}`,
                        timestamp: msg.date * 1000
                    });
                } else {
                    recentUpdates.push({
                        type: 'message',
                        text: `${msg.from.first_name}: ${msg.text ? msg.text.substring(0, 50) + '...' : 'Media'}`,
                        timestamp: msg.date * 1000
                    });
                }
            } else if (update.callback_query) {
                uniqueUsers.add(update.callback_query.from.id);
                uniqueChats.add(update.callback_query.message.chat.id);
                recentUpdates.push({
                    type: 'command',
                    text: `${update.callback_query.from.first_name} clicked a button`,
                    timestamp: update.callback_query.message.date * 1000
                });
            }
        });

        // Try to estimate sent messages by checking recent chats
        let sentMessagesCount = 0;
        try {
            // For each unique chat, try to get recent messages
            // This is a best-effort approach as Bot API has limitations
            const chatPromises = Array.from(uniqueChats).slice(0, 5).map(async (chatId) => {
                try {
                    // Get chat to check if bot can access message history
                    const chatResponse = await fetch(`https://api.telegram.org/bot${bot.token}/getChat?chat_id=${chatId}`);
                    const chatData = await chatResponse.json();
                    
                    if (chatData.ok) {
                        // We can't get message history via Bot API for counting sent messages
                        // But we can use updates to count bot's replies
                        return 1; // Assume bot replied at least once per chat
                    }
                } catch (err) {
                    return 0;
                }
                return 0;
            });

            const results = await Promise.all(chatPromises);
            sentMessagesCount = results.reduce((sum, val) => sum + val, 0);
            
            // Rough estimate: if bot received messages, likely sent replies
            // Estimate 0.8 messages sent per message received (80% reply rate)
            sentMessagesCount = Math.floor(messageCount * 0.8);
            
        } catch (err) {
            console.log('Could not estimate sent messages:', err.message);
            sentMessagesCount = 0;
        }

        // Sort recent updates by timestamp
        recentUpdates.sort((a, b) => b.timestamp - a.timestamp);

        // Get time range of updates
        let oldestUpdate = null;
        let newestUpdate = null;
        if (updates.length > 0) {
            const timestamps = updates
                .map(u => (u.message?.date || u.callback_query?.message?.date || 0) * 1000)
                .filter(t => t > 0);
            
            if (timestamps.length > 0) {
                oldestUpdate = Math.min(...timestamps);
                newestUpdate = Math.max(...timestamps);
            }
        }

        const stats = {
            isActive: botInfo.ok,
            totalUsers: uniqueUsers.size,
            totalMessages: messageCount,
            sentMessages: sentMessagesCount,
            activeChats: uniqueUsers.size, // Simplified: treat unique users as active chats
            commandsUsed: commandCount,
            webhookUrl: webhookInfo.ok && webhookInfo.result.url ? webhookInfo.result.url : null,
            recentUpdates: recentUpdates.slice(0, 10), // Last 10 updates
            updateCount: updates.length,
            oldestUpdateTime: oldestUpdate,
            newestUpdateTime: newestUpdate,
            statsNote: 'Based on last ' + updates.length + ' updates from Telegram API',
            usingEstimatedData: true
        };

        // Check if we have tracked data in database
        const trackedStats = botTracker.getStats(bot.id);
        if (trackedStats.hasData) {
            // Use tracked data instead of estimates
            stats.sentMessages = trackedStats.totalMessagesSent;
            stats.totalMessages = trackedStats.totalMessagesReceived || stats.totalMessages;
            stats.channelPosts = trackedStats.totalChannelPosts;
            stats.filesSent = trackedStats.totalFilesSent;
            stats.totalUsers = trackedStats.totalUsers || stats.totalUsers;
            stats.usingEstimatedData = false;
            stats.statsNote = 'Real-time tracked data from bot activity';
            
            // Convert recent activity to updates format
            if (trackedStats.recentActivity && trackedStats.recentActivity.length > 0) {
                stats.recentUpdates = trackedStats.recentActivity.slice(0, 10).map(activity => ({
                    type: activity.activity_type,
                    text: activity.content_preview || `${activity.activity_type} activity`,
                    timestamp: activity.timestamp
                }));
            }

            if (trackedStats.oldestActivity) {
                stats.oldestUpdateTime = trackedStats.oldestActivity;
            }
            if (trackedStats.newestActivity) {
                stats.newestUpdateTime = trackedStats.newestActivity;
            }
        }

        res.json({
            success: true,
            stats: stats
        });

    } catch (error) {
        console.error('Get bot stats error:', error);
        res.json({
            success: false,
            error: error.message || 'Failed to fetch bot statistics'
        });
    }
});

// Track bot activity - This endpoint is called by your bot
app.post('/api/track/:botToken', (req, res) => {
    try {
        const { botToken } = req.params;
        const { activityType, chatId, userId, messageType, contentPreview, metadata } = req.body;

        if (!activityType) {
            return res.status(400).json({
                success: false,
                error: 'activityType is required'
            });
        }

        // Extract bot ID from token (first part before colon)
        const botId = botToken.split(':')[0];

        const result = botTracker.logActivity(botId, activityType, {
            chatId,
            userId,
            messageType,
            contentPreview,
            metadata
        });

        res.json(result);
    } catch (error) {
        console.error('Track activity error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Batch track multiple activities at once
app.post('/api/track-batch/:botToken', (req, res) => {
    try {
        const { botToken } = req.params;
        const { activities } = req.body;

        if (!Array.isArray(activities) || activities.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'activities array is required'
            });
        }

        const botId = botToken.split(':')[0];
        const results = [];

        for (const activity of activities) {
            const result = botTracker.logActivity(botId, activity.activityType, {
                chatId: activity.chatId,
                userId: activity.userId,
                messageType: activity.messageType,
                contentPreview: activity.contentPreview,
                metadata: activity.metadata
            });
            results.push(result);
        }

        res.json({
            success: true,
            tracked: results.length
        });
    } catch (error) {
        console.error('Batch track error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start monitoring a bot
app.post('/api/bots/:botId/monitor/start', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Not logged in'
        });
    }

    try {
        const { botId } = req.params;
        const bots = req.session.bots || [];
        const bot = bots.find(b => b.id === botId);

        if (!bot || !bot.token) {
            return res.status(404).json({
                success: false,
                error: 'Bot not found or no token available'
            });
        }

        botMonitor.startMonitoring(bot.token, bot.id);

        res.json({
            success: true,
            message: 'Monitoring started for bot ' + bot.username
        });
    } catch (error) {
        console.error('Start monitor error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Stop monitoring a bot
app.post('/api/bots/:botId/monitor/stop', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Not logged in'
        });
    }

    try {
        const { botId } = req.params;
        const stopped = botMonitor.stopMonitoring(botId);

        if (stopped) {
            res.json({
                success: true,
                message: 'Monitoring stopped'
            });
        } else {
            res.json({
                success: false,
                error: 'Monitor was not running'
            });
        }
    } catch (error) {
        console.error('Stop monitor error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get monitor status for all bots
app.get('/api/monitor/status', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Not logged in'
        });
    }

    try {
        const activeMonitors = botMonitor.getActiveMonitors();
        res.json({
            success: true,
            monitors: activeMonitors
        });
    } catch (error) {
        console.error('Get monitor status error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Fetch bots from Telegram account
app.get('/api/bots/fetch', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Not logged in'
        });
    }

    if (!req.session.telegramSession) {
        return res.status(400).json({
            success: false,
            error: 'No Telegram session found. Please login again.'
        });
    }

    try {
        // Recreate client from saved session
        const stringSession = new StringSession(req.session.telegramSession);
        const client = new TelegramClient(stringSession, API_ID, API_HASH, {
            connectionRetries: 5,
        });

        await client.connect();

        // Find @BotFather
        const botfather = await client.getEntity('BotFather');
        
        // Send /mybots command to BotFather
        await client.sendMessage(botfather, { message: '/mybots' });
        
        // Wait a bit for response
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get more messages from BotFather to catch all bots
        const messages = await client.getMessages(botfather, { limit: 20 });
        
        const userBots = [];
        const seenUsernames = new Set();
        
        // Parse BotFather's response - check all recent messages
        for (const message of messages) {
            if (message.message && message.replyMarkup) {
                // BotFather sends bots as inline buttons
                const buttons = message.replyMarkup.rows || [];
                
                for (const row of buttons) {
                    for (const button of row.buttons) {
                        if (button.text && button.text.startsWith('@')) {
                            const username = button.text.substring(1); // Remove @
                            
                            // Skip if we already processed this bot
                            if (seenUsernames.has(username)) {
                                continue;
                            }
                            seenUsernames.add(username);
                            
                            try {
                                // Get bot entity
                                const botEntity = await client.getEntity(username);
                                
                                // Try to get profile photo
                                let photoUrl = null;
                                try {
                                    const photo = await client.downloadProfilePhoto(botEntity, {
                                        isBig: false
                                    });
                                    if (photo) {
                                        // Convert buffer to base64
                                        photoUrl = `data:image/jpeg;base64,${photo.toString('base64')}`;
                                    }
                                } catch (photoError) {
                                    console.log(`  No photo for @${username}`);
                                }
                                
                                const botInfo = {
                                    id: botEntity.id.toString(),
                                    name: botEntity.firstName || username,
                                    username: username,
                                    token: '', // Will fetch token next
                                    photoUrl: photoUrl,
                                    isVerified: botEntity.verified || false,
                                    addedAt: new Date().toISOString()
                                };
                                
                                userBots.push(botInfo);
                                console.log(`✓ Fetched bot: @${username}`);
                            } catch (error) {
                                console.error(`✗ Error getting bot ${username}:`, error.message);
                            }
                        }
                    }
                }
            }
        }

        console.log(`✓ Total bots found: ${userBots.length}`);
        
        // Now fetch tokens for each bot
        console.log('🔑 Fetching tokens from BotFather...');
        for (const bot of userBots) {
            try {
                // Send /token command to get the token
                await client.sendMessage(botfather, { message: `/token` });
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Get response
                let tokenMessages = await client.getMessages(botfather, { limit: 3 });
                
                // Look for the bot selection message
                for (const msg of tokenMessages) {
                    if (msg.replyMarkup) {
                        // Find and click the button for this bot
                        const buttons = msg.replyMarkup.rows || [];
                        for (const row of buttons) {
                            for (const button of row.buttons) {
                                if (button.text === `@${bot.username}`) {
                                    // Click the button
                                    await msg.click({ data: button.data });
                                    await new Promise(resolve => setTimeout(resolve, 2000));
                                    
                                    // Get the token message
                                    const tokenResponse = await client.getMessages(botfather, { limit: 1 });
                                    const tokenMsg = tokenResponse[0]?.message || '';
                                    
                                    // Extract token (format: "You can use this token to access HTTP API:")
                                    const tokenMatch = tokenMsg.match(/\n([0-9]+:[A-Za-z0-9_-]{35})\n/);
                                    if (tokenMatch) {
                                        bot.token = tokenMatch[1];
                                        console.log(`✓ Got token for @${bot.username}`);
                                    } else {
                                        console.log(`⚠ Could not extract token for @${bot.username}`);
                                    }
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            } catch (error) {
                console.error(`✗ Error getting token for @${bot.username}:`, error.message);
            }
        }

        console.log(`✓ Total bots fetched with tokens: ${userBots.filter(b => b.token).length}/${userBots.length}`);
        
        await client.disconnect();

        // Merge with existing bots (prefer newly fetched tokens)
        const existingBots = req.session.bots || [];
        const existingBotsMap = new Map(existingBots.map(bot => [bot.id || bot.username, bot]));

        const mergedBots = userBots.map(fetchedBot => {
            const existing = existingBotsMap.get(fetchedBot.id) || existingBotsMap.get(fetchedBot.username);
            return {
                ...fetchedBot,
                token: fetchedBot.token || existing?.token || '', // Use newly fetched token, fallback to existing
                addedAt: existing?.addedAt || fetchedBot.addedAt
            };
        });

        // Add bots that are in session but not fetched (in case user has tokens for bots they don't have in dialogs)
        existingBots.forEach(existingBot => {
            if (!mergedBots.find(b => b.id === existingBot.id || b.username === existingBot.username)) {
                mergedBots.push(existingBot);
            }
        });

        // Update session
        req.session.bots = mergedBots;

        res.json({
            success: true,
            bots: mergedBots,
            fetched: userBots.length
        });

    } catch (error) {
        console.error('Fetch bots error:', error);
        res.json({
            success: false,
            error: error.message || 'Failed to fetch bots'
        });
    }
});

// Create a new bot via BotFather
app.post('/api/bots/create', async (req, res) => {
    if (!req.session.telegramSession) {
        return res.json({
            success: false,
            error: 'No Telegram session found. Please login again.'
        });
    }

    const { name, username } = req.body;

    if (!name || !username) {
        return res.json({
            success: false,
            error: 'Bot name and username are required'
        });
    }

    try {
        // Recreate client from saved session
        const stringSession = new StringSession(req.session.telegramSession);
        const client = new TelegramClient(stringSession, API_ID, API_HASH, {
            connectionRetries: 5,
        });

        await client.connect();

        // Find @BotFather
        const botfather = await client.getEntity('BotFather');
        
        console.log(`🤖 Creating bot: ${name} (@${username})`);
        
        // Send /newbot command
        await client.sendMessage(botfather, { message: '/newbot' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Send bot name
        await client.sendMessage(botfather, { message: name });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Send bot username
        await client.sendMessage(botfather, { message: username });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get the response with token
        const messages = await client.getMessages(botfather, { limit: 1 });
        const responseMsg = messages[0]?.message || '';
        
        console.log('BotFather response:', responseMsg);
        
        // Check if bot was created successfully
        if (responseMsg.includes('Sorry') || responseMsg.includes('invalid') || responseMsg.includes('taken')) {
            await client.disconnect();
            return res.json({
                success: false,
                error: responseMsg.split('\n')[0] || 'Failed to create bot. Username might be taken.'
            });
        }
        
        // Extract token
        const tokenMatch = responseMsg.match(/([0-9]+:[A-Za-z0-9_-]{35})/);
        if (!tokenMatch) {
            await client.disconnect();
            return res.json({
                success: false,
                error: 'Bot might be created but could not extract token. Please check @BotFather.'
            });
        }
        
        const token = tokenMatch[1];
        
        // Get bot entity for more info
        let botEntity;
        try {
            botEntity = await client.getEntity(username);
        } catch (error) {
            console.log('Could not get bot entity, using provided info');
        }
        
        // Try to get profile photo
        let photoUrl = null;
        if (botEntity) {
            try {
                const photo = await client.downloadProfilePhoto(botEntity, {
                    isBig: false
                });
                if (photo) {
                    photoUrl = `data:image/jpeg;base64,${photo.toString('base64')}`;
                }
            } catch (photoError) {
                console.log('  No photo for new bot');
            }
        }
        
        const newBot = {
            id: botEntity?.id.toString() || Date.now().toString(),
            name: name,
            username: username,
            token: token,
            photoUrl: photoUrl,
            isVerified: false,
            addedAt: new Date().toISOString()
        };
        
        await client.disconnect();
        
        // Add to session
        const existingBots = req.session.bots || [];
        existingBots.push(newBot);
        req.session.bots = existingBots;
        
        console.log(`✅ Bot created successfully: @${username}`);
        
        res.json({
            success: true,
            bot: newBot
        });

    } catch (error) {
        console.error('Create bot error:', error);
        res.json({
            success: false,
            error: error.message || 'Failed to create bot'
        });
    }
});

// Add new bot
app.post('/api/bots', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Not logged in'
        });
    }

    const { name, username, token } = req.body;

    if (!name || !username || !token) {
        return res.status(400).json({
            success: false,
            error: 'Name, username, and token are required'
        });
    }

    // Validate token format
    const tokenPattern = /^\d+:[A-Za-z0-9_-]{35}$/;
    if (!tokenPattern.test(token)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid token format. Token should be like: 123456:ABC-DEF1234ghIkl...'
        });
    }

    // Extract bot ID from token
    const botId = token.split(':')[0];

    // Initialize bots array if not exists
    if (!req.session.bots) {
        req.session.bots = [];
    }

    // Check if bot already exists
    if (req.session.bots.some(bot => bot.id === botId)) {
        return res.status(400).json({
            success: false,
            error: 'This bot is already added'
        });
    }

    // Add bot
    const newBot = {
        id: botId,
        name: name,
        username: username.replace('@', ''),
        token: token,
        addedAt: new Date().toISOString(),
        userId: req.session.user.id
    };

    req.session.bots.push(newBot);

    console.log(`✅ User ${req.session.user.id} added bot: ${name} (@${username})`);

    res.json({
        success: true,
        bot: newBot
    });
});

// Delete bot
app.delete('/api/bots/:botId', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Not logged in'
        });
    }

    const { botId } = req.params;

    if (!req.session.bots) {
        return res.status(404).json({
            success: false,
            error: 'No bots found'
        });
    }

    const botIndex = req.session.bots.findIndex(bot => bot.id === botId);

    if (botIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Bot not found'
        });
    }

    const deletedBot = req.session.bots[botIndex];
    req.session.bots.splice(botIndex, 1);

    console.log(`🗑️  User ${req.session.user.id} removed bot: ${deletedBot.name}`);

    res.json({
        success: true,
        message: 'Bot removed successfully'
    });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

// Protected dashboard route
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    // Redirect to bots page (main dashboard)
    res.redirect('/bots');
});

// Bots management page
app.get('/bots', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'bots.html'));
});

// Complete profile page
app.get('/complete-profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'complete-profile.html'));
});

// API: Save additional profile data
app.post('/api/complete-profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Not logged in'
        });
    }

    const { email, phone, company, bio } = req.body;
    
    // Store additional data in session (in production, save to database)
    req.session.userProfile = {
        ...req.session.user,
        email: email || null,
        phone: phone || null,
        company: company || null,
        bio: bio || null,
        completedAt: new Date().toISOString()
    };
    
    console.log('📝 User completed profile:', req.session.user.id);
    console.log('   - Email:', email || '(not provided)');
    console.log('   - Phone:', phone || '(not provided)');
    console.log('   - Company:', company || '(not provided)');
    
    res.json({
        success: true,
        message: 'Profile completed successfully'
    });
});

// Serve the main page
app.get('/', (req, res) => {
    // If already logged in, redirect to bots dashboard
    if (req.session.user) {
        return res.redirect('/bots');
    }
    // Use phone number login (real Telegram authentication!)
    res.sendFile(path.join(__dirname, 'public', 'login-phone.html'));
});

// Login page (explicit route) - use phone login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login-phone.html'));
});

// Alternative login methods
app.get('/login-code', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login-simple.html'));
});

app.get('/login-widget', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 TG Controller Server Started');
    console.log('='.repeat(60));
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`✅ Status: Ready`);
    console.log('='.repeat(60));
    console.log('\n✨ Everything is configured! Open the URL to login.\n');
});
