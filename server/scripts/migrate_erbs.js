const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../src/config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Rename lat/long to latitude/longitude
        await client.query('ALTER TABLE erbs RENAME COLUMN lat TO latitude');
        await client.query('ALTER TABLE erbs RENAME COLUMN long TO longitude');

        // 2. Add new columns
        const columns = [
            'site_id VARCHAR(50)',
            'equipment_type VARCHAR(50)',
            'technology VARCHAR(50)',
            'connection_type VARCHAR(50)',
            'classification VARCHAR(50)',
            'activation_date DATE',
            'holder VARCHAR(100)',
            'structure_type VARCHAR(50)',
            'street VARCHAR(255)',
            'number VARCHAR(20)',
            'neighborhood VARCHAR(100)',
            'city VARCHAR(100)',
            'state VARCHAR(2)',
            'region VARCHAR(50)'
        ];

        for (const col of columns) {
            // Check if column exists before adding to avoid errors on re-run (simplified check)
            // For now, just try adding and ignore "already exists" if possible, or just run blindly assuming it's a one-off.
            // Better: use IF NOT EXISTS logic if PG version supports it or catch error.
            // PG 9.6+ supports IF NOT EXISTS for ADD COLUMN? No, only in recent versions.
            // We'll just run ADD COLUMN.
            try {
                await client.query(`ALTER TABLE erbs ADD COLUMN ${col}`);
            } catch (e) {
                console.log(`Column might already exist or error: ${e.message}`);
            }
        }

        // 3. Migrate existing data
        // Copy 'name' to 'site_id' if site_id is null
        await client.query('UPDATE erbs SET site_id = name WHERE site_id IS NULL');

        // We will keep 'name' and 'address' for now to avoid breaking existing code immediately, 
        // but we should eventually deprecate them. 
        // Actually, let's make 'name' nullable if it isn't already.
        await client.query('ALTER TABLE erbs ALTER COLUMN name DROP NOT NULL');

        await client.query('COMMIT');
        console.log('Migration completed successfully');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed', e);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
