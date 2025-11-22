const { pool } = require('../config/db')

/**
 * Log an event to the system_logs table
 * @param {string} level - 'info', 'warning', 'error'
 * @param {string} message - Description of the event
 * @param {number} [userId] - Optional user ID associated with the event
 */
async function logEvent(level, message, userId = null) {
    try {
        await pool.query(
            'INSERT INTO system_logs (level, message, user_id) VALUES ($1, $2, $3)',
            [level, message, userId]
        )
    } catch (err) {
        console.error('Failed to write to system_logs:', err)
    }
}

module.exports = { logEvent }
