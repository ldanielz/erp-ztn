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

    // create system_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        level VARCHAR(32) NOT NULL,
        message TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // create system_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Insert default settings if not exist
    await client.query(`
      INSERT INTO system_settings (key, value)
      VALUES 
        ('site_name', 'ERP ZTN'),
        ('maintenance_mode', 'false'),
        ('allow_registration', 'true')
      ON CONFLICT (key) DO NOTHING;
    `)

    // Create clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'B2B',
        document VARCHAR(50),
        contact_info TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create erbs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS erbs (
        id SERIAL PRIMARY KEY,
        site_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address TEXT,
        status VARCHAR(50) DEFAULT 'active',
        equipment_type VARCHAR(100),
        technology VARCHAR(100),
        connection_type VARCHAR(100),
        classification VARCHAR(100),
        activation_date DATE,
        holder VARCHAR(255),
        structure_type VARCHAR(100),
        street VARCHAR(255),
        number VARCHAR(20),
        neighborhood VARCHAR(100),
        city VARCHAR(100),
        state VARCHAR(2),
        region VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Ensure new columns exist for existing databases
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='site_id') THEN
          ALTER TABLE erbs ADD COLUMN site_id VARCHAR(255) UNIQUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='latitude') THEN
          ALTER TABLE erbs ADD COLUMN latitude DECIMAL(10, 8);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='longitude') THEN
          ALTER TABLE erbs ADD COLUMN longitude DECIMAL(11, 8);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='equipment_type') THEN
          ALTER TABLE erbs ADD COLUMN equipment_type VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='technology') THEN
          ALTER TABLE erbs ADD COLUMN technology VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='connection_type') THEN
          ALTER TABLE erbs ADD COLUMN connection_type VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='classification') THEN
          ALTER TABLE erbs ADD COLUMN classification VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='activation_date') THEN
          ALTER TABLE erbs ADD COLUMN activation_date DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='holder') THEN
          ALTER TABLE erbs ADD COLUMN holder VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='structure_type') THEN
          ALTER TABLE erbs ADD COLUMN structure_type VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='street') THEN
          ALTER TABLE erbs ADD COLUMN street VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='number') THEN
          ALTER TABLE erbs ADD COLUMN number VARCHAR(20);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='neighborhood') THEN
          ALTER TABLE erbs ADD COLUMN neighborhood VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='city') THEN
          ALTER TABLE erbs ADD COLUMN city VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='state') THEN
          ALTER TABLE erbs ADD COLUMN state VARCHAR(2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='erbs' AND column_name='region') THEN
          ALTER TABLE erbs ADD COLUMN region VARCHAR(100);
        END IF;
      END$$;
    `)

    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        client_id INTEGER REFERENCES clients(id),
        status VARCHAR(50) DEFAULT 'planning',
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        project_id INTEGER REFERENCES projects(id),
        assignee_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
      // Create ERB audit log table (track changes to ERBs)
      await client.query(`
        CREATE TABLE IF NOT EXISTS erb_audit_log (
          id SERIAL PRIMARY KEY,
          erb_id INTEGER REFERENCES erbs(id) ON DELETE CASCADE,
          action VARCHAR(50) NOT NULL,
          changed_fields JSONB,
          old_values JSONB,
          new_values JSONB,
          changed_by_user_id INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)

      // Create index for faster audit lookups
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_erb_audit_log_erb_id 
        ON erb_audit_log(erb_id)
      `)

      client.release()
      console.log('Database initialized')
  } catch (err) {
    console.error('Error initializing database', err)
  }
}

module.exports = { pool, initDb }
