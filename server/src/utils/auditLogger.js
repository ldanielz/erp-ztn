const { pool } = require('../config/db')

/**
 * Log a change to an ERB in the audit log
 * @param {number} erb_id - ID of the ERB
 * @param {string} action - Action type: 'CREATE', 'UPDATE', 'DELETE', 'IMPORT'
 * @param {object} old_values - Previous values (null for CREATE)
 * @param {object} new_values - New values (null for DELETE)
 * @param {number} user_id - ID of user making the change
 */
async function logErbChange(erb_id, action, old_values = null, new_values = null, user_id = null) {
  try {
    // Determine which fields changed
    let changed_fields = []
    if (old_values && new_values) {
      Object.keys(new_values).forEach(key => {
        if (JSON.stringify(old_values[key]) !== JSON.stringify(new_values[key])) {
          changed_fields.push(key)
        }
      })
    } else if (action === 'CREATE') {
      changed_fields = Object.keys(new_values || {})
    } else if (action === 'DELETE') {
      changed_fields = Object.keys(old_values || {})
    }

    await pool.query(
      `INSERT INTO erb_audit_log (erb_id, action, changed_fields, old_values, new_values, changed_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        erb_id,
        action,
        JSON.stringify(changed_fields),
        JSON.stringify(old_values),
        JSON.stringify(new_values),
        user_id
      ]
    )
  } catch (err) {
    console.error('Error logging ERB change:', err)
    // Don't fail the main operation if audit logging fails
  }
}

/**
 * Get audit log for an ERB
 * @param {number} erb_id - ID of the ERB
 */
async function getErbAuditLog(erb_id) {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        action,
        changed_fields,
        old_values,
        new_values,
        changed_by_user_id,
        created_at
       FROM erb_audit_log
       WHERE erb_id = $1
       ORDER BY created_at DESC`,
      [erb_id]
    )
    return result.rows
  } catch (err) {
    console.error('Error retrieving ERB audit log:', err)
    return []
  }
}

module.exports = { logErbChange, getErbAuditLog }
