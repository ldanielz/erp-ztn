const xlsx = require('xlsx');
const { pool } = require('../config/db');

const COLUMN_MAP = {
    'SITE_ID': 'site_id',
    'TIPO_DE_EQUIPAMENTO': 'equipment_type',
    'TECNOLOGIA': 'technology',
    'TIPO_DE_CONEXAO': 'connection_type',
    'CLASSIFICACAO': 'classification',
    'DATA_DE_ATIVACAO': 'activation_date',
    'DETENTOR': 'holder',
    'TIPO_DE_ESTRUTURA': 'structure_type',
    'LOGRADOURO': 'street',
    'NUMERO': 'number',
    'BAIRRO': 'neighborhood',
    'MUNICIPIO': 'city',
    'ESTADO': 'state',
    'REGIONAL': 'region',
    'LATITUDE': 'latitude',
    'LONGITUDE': 'longitude',
    'STATUS': 'status'
};

async function importErbs(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const client = await pool.connect();
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty' });
        }

        await client.query('BEGIN');

        let insertedCount = 0;
        let updatedCount = 0;

        for (const row of data) {
            // Map row keys to db columns
            const dbRow = {};
            for (const [excelKey, dbKey] of Object.entries(COLUMN_MAP)) {
                // Handle case-insensitive matching or exact matching? 
                // Excel headers might have spaces or different casing.
                // For now, assume exact match or try to find key.
                // Let's try to find the key in row that matches excelKey (ignoring case/spaces if needed, but let's stick to simple first)

                // Find key in row that loosely matches excelKey
                const rowKey = Object.keys(row).find(k => k.toUpperCase().replace(/_/g, ' ').trim() === excelKey.replace(/_/g, ' '));

                let value = row[rowKey || excelKey];

                // Data transformation
                if (dbKey === 'activation_date' && value) {
                    // Excel dates are numbers or strings
                    if (typeof value === 'number') {
                        // Excel date serial number
                        const date = new Date(Math.round((value - 25569) * 86400 * 1000));
                        value = date.toISOString().split('T')[0];
                    }
                }

                dbRow[dbKey] = value;
            }

            // Ensure site_id is present
            if (!dbRow.site_id) continue;

            // Check if exists
            const existing = await client.query('SELECT id FROM erbs WHERE site_id = $1', [dbRow.site_id]);

            if (existing.rows.length > 0) {
                // Update
                const updateFields = Object.keys(dbRow).filter(k => k !== 'site_id').map((k, i) => `${k} = $${i + 2}`).join(', ');
                const values = [dbRow.site_id, ...Object.keys(dbRow).filter(k => k !== 'site_id').map(k => dbRow[k])];

                if (updateFields.length > 0) {
                    await client.query(`UPDATE erbs SET ${updateFields} WHERE site_id = $1`, values);
                    updatedCount++;
                }
            } else {
                // Insert
                // We also need to populate 'name' and 'address' for legacy compatibility if they are not null
                // But we made 'name' nullable. 'address' is still there.
                // Let's construct 'address' from components if possible.
                const address = `${dbRow.street || ''}, ${dbRow.number || ''}, ${dbRow.neighborhood || ''}, ${dbRow.city || ''} - ${dbRow.state || ''}`;

                const columns = [...Object.keys(dbRow), 'name', 'address'];
                const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
                const values = [...Object.values(dbRow), dbRow.site_id, address]; // Use site_id as name

                await client.query(`INSERT INTO erbs (${columns.join(', ')}) VALUES (${placeholders})`, values);
                insertedCount++;
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Import successful', inserted: insertedCount, updated: updatedCount });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Import error', err);
        res.status(500).json({ message: 'Error processing file: ' + err.message });
    } finally {
        client.release();
    }
}

async function exportErbs(req, res) {
    try {
        const result = await pool.query('SELECT * FROM erbs ORDER BY site_id');
        const rows = result.rows;

        // Map back to Excel columns
        const excelData = rows.map(row => {
            const excelRow = {};
            for (const [excelKey, dbKey] of Object.entries(COLUMN_MAP)) {
                excelRow[excelKey] = row[dbKey];
            }
            return excelRow;
        });

        const workbook = xlsx.utils.book_new();
        const sheet = xlsx.utils.json_to_sheet(excelData);
        xlsx.utils.book_append_sheet(workbook, sheet, 'ERBs');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="erbs_export.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (err) {
        console.error('Export error', err);
        res.status(500).json({ message: 'Error exporting data' });
    }
}

module.exports = { importErbs, exportErbs };
