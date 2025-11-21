const { Pool } = require('pg')

let pool = null

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL })
} else {
  console.warn('Warning: DATABASE_URL not set. DB operations will be disabled. To enable, set DATABASE_URL in .env')
}

async function initDb() {
  if (!pool) {
    console.log('Skipping DB init because DATABASE_URL is not configured')
    return
  }
  try {
    const client = await pool.connect()
    // create users table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(32) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    // ensure role column exists (for older databases)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(32) DEFAULT 'user';
        END IF;
      END$$;
    `)
    client.release()
    console.log('Database initialized')
  } catch (err) {
    console.error('Error initializing database', err)
  }
}

module.exports = { pool, initDb }
