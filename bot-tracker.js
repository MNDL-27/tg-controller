const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'bot-activity.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS bot_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_id TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        chat_id TEXT,
        user_id TEXT,
        message_type TEXT,
        content_preview TEXT,
        timestamp INTEGER NOT NULL,
        metadata TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_bot_timestamp ON bot_activity(bot_id, timestamp);
    CREATE INDEX IF NOT EXISTS idx_activity_type ON bot_activity(activity_type);
    CREATE INDEX IF NOT EXISTS idx_bot_chat ON bot_activity(bot_id, chat_id);

    CREATE TABLE IF NOT EXISTS bot_stats_cache (
        bot_id TEXT PRIMARY KEY,
        total_messages_sent INTEGER DEFAULT 0,
        total_messages_received INTEGER DEFAULT 0,
        total_channel_posts INTEGER DEFAULT 0,
        total_files_sent INTEGER DEFAULT 0,
        total_users INTEGER DEFAULT 0,
        last_updated INTEGER NOT NULL
    );
`);

console.log('✅ Bot tracker database initialized');

// Log activity
function logActivity(botId, activityType, data = {}) {
    try {
        const stmt = db.prepare(`
            INSERT INTO bot_activity (bot_id, activity_type, chat_id, user_id, message_type, content_preview, timestamp, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            botId,
            activityType,
            data.chatId || null,
            data.userId || null,
            data.messageType || null,
            data.contentPreview || null,
            Date.now(),
            JSON.stringify(data.metadata || {})
        );

        // Update stats cache
        updateStatsCache(botId);

        return { success: true };
    } catch (error) {
        console.error('Error logging activity:', error);
        return { success: false, error: error.message };
    }
}

// Update stats cache
function updateStatsCache(botId) {
    try {
        const stats = getStats(botId);
        
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO bot_stats_cache (bot_id, total_messages_sent, total_messages_received, total_channel_posts, total_files_sent, total_users, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            botId,
            stats.totalMessagesSent,
            stats.totalMessagesReceived,
            stats.totalChannelPosts,
            stats.totalFilesSent,
            stats.totalUsers,
            Date.now()
        );
    } catch (error) {
        console.error('Error updating stats cache:', error);
    }
}

// Get stats for a bot
function getStats(botId, timeRange = null) {
    try {
        let whereClause = 'WHERE bot_id = ?';
        let params = [botId];

        if (timeRange) {
            const startTime = Date.now() - timeRange;
            whereClause += ' AND timestamp >= ?';
            params.push(startTime);
        }

        // Total messages sent
        const sentStmt = db.prepare(`
            SELECT COUNT(*) as count FROM bot_activity 
            ${whereClause} AND activity_type IN ('message_sent', 'channel_post', 'file_sent')
        `);
        const sentResult = sentStmt.get(...params);
        const totalMessagesSent = sentResult.count;

        // Total messages received
        const receivedStmt = db.prepare(`
            SELECT COUNT(*) as count FROM bot_activity 
            ${whereClause} AND activity_type = 'message_received'
        `);
        const receivedResult = receivedStmt.get(...params);
        const totalMessagesReceived = receivedResult.count;

        // Channel posts
        const channelStmt = db.prepare(`
            SELECT COUNT(*) as count FROM bot_activity 
            ${whereClause} AND activity_type = 'channel_post'
        `);
        const channelResult = channelStmt.get(...params);
        const totalChannelPosts = channelResult.count;

        // Files sent
        const filesStmt = db.prepare(`
            SELECT COUNT(*) as count FROM bot_activity 
            ${whereClause} AND activity_type = 'file_sent'
        `);
        const filesResult = filesStmt.get(...params);
        const totalFilesSent = filesResult.count;

        // Unique users
        const usersStmt = db.prepare(`
            SELECT COUNT(DISTINCT user_id) as count FROM bot_activity 
            ${whereClause} AND user_id IS NOT NULL
        `);
        const usersResult = usersStmt.get(...params);
        const totalUsers = usersResult.count;

        // Recent activity
        const recentStmt = db.prepare(`
            SELECT activity_type, chat_id, user_id, message_type, content_preview, timestamp
            FROM bot_activity 
            ${whereClause}
            ORDER BY timestamp DESC
            LIMIT 20
        `);
        const recentActivity = recentStmt.all(...params);

        // Time range info
        const timeRangeStmt = db.prepare(`
            SELECT MIN(timestamp) as oldest, MAX(timestamp) as newest 
            FROM bot_activity 
            WHERE bot_id = ?
        `);
        const timeRangeResult = timeRangeStmt.get(botId);

        return {
            totalMessagesSent,
            totalMessagesReceived,
            totalChannelPosts,
            totalFilesSent,
            totalUsers,
            recentActivity,
            oldestActivity: timeRangeResult.oldest,
            newestActivity: timeRangeResult.newest,
            hasData: totalMessagesSent > 0 || totalMessagesReceived > 0
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        return {
            totalMessagesSent: 0,
            totalMessagesReceived: 0,
            totalChannelPosts: 0,
            totalFilesSent: 0,
            totalUsers: 0,
            recentActivity: [],
            hasData: false
        };
    }
}

// Get activity for a specific time period
function getActivityByPeriod(botId, period = '24h') {
    const periodMap = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
    };

    const timeRange = periodMap[period] || periodMap['24h'];
    return getStats(botId, timeRange);
}

// Clear old activity (optional - for cleanup)
function cleanupOldActivity(daysToKeep = 90) {
    try {
        const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        const stmt = db.prepare('DELETE FROM bot_activity WHERE timestamp < ?');
        const result = stmt.run(cutoffTime);
        console.log(`🧹 Cleaned up ${result.changes} old activity records`);
        return result.changes;
    } catch (error) {
        console.error('Error cleaning up old activity:', error);
        return 0;
    }
}

module.exports = {
    logActivity,
    getStats,
    getActivityByPeriod,
    updateStatsCache,
    cleanupOldActivity,
    db
};
