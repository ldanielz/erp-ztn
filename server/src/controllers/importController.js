const xlsx = require('xlsx');
const { pool } = require('../config/db');
const { logErbChange } = require('../utils/auditLogger');

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
        const errors = [];

        for (let idx = 0; idx < data.length; idx++) {
            const row = data[idx];
            try {
                // Map row keys to db columns
                const dbRow = {};
                for (const [excelKey, dbKey] of Object.entries(COLUMN_MAP)) {
                    // Find key in row that loosely matches excelKey (case-insensitive, spaces handled)
                    const rowKey = Object.keys(row).find(k => 
                        k.toUpperCase().replace(/\s+/g, '_') === excelKey.toUpperCase()
                    );

                    let value = row[rowKey];

                    // Data transformation
                    if (dbKey === 'activation_date' && value) {
                        // Excel dates are numbers or strings
                        if (typeof value === 'number') {
                            // Excel date serial number
                            const date = new Date(Math.round((value - 25569) * 86400 * 1000));
                            value = date.toISOString().split('T')[0];
                        } else if (typeof value === 'string') {
                            // Try to parse string date
                            const parsed = new Date(value);
                            if (!isNaN(parsed)) {
                                value = parsed.toISOString().split('T')[0];
                            }
                        }
                    }

                    // Only add if value exists
                    if (value !== undefined && value !== null && value !== '') {
                        dbRow[dbKey] = value;
                    }
                }

                // Ensure site_id is present
                if (!dbRow.site_id) {
                    errors.push(`Row ${idx + 1}: Missing SITE_ID`);
                    continue;
                }

                // Check if exists
                const existing = await client.query('SELECT id FROM erbs WHERE site_id = $1', [dbRow.site_id]);

                if (existing.rows.length > 0) {
                    const erbId = existing.rows[0].id;
                    const oldResult = await client.query('SELECT * FROM erbs WHERE id = $1', [erbId]);
                    const oldValues = oldResult.rows[0];

                    // Update: only update fields that are provided
                    const updateFields = Object.keys(dbRow)
                        .filter(k => k !== 'site_id')
                        .map((k, i) => `${k} = $${i + 2}`);
                    
                    if (updateFields.length > 0) {
                        const values = [dbRow.site_id, ...Object.keys(dbRow)
                            .filter(k => k !== 'site_id')
                            .map(k => dbRow[k])];
                        
                        const updateResult = await client.query(
                            `UPDATE erbs SET ${updateFields.join(', ')} WHERE site_id = $1`, 
                            values
                        );
                        await logErbChange(erbId, 'IMPORT', oldValues, {...oldValues, ...dbRow}, req.user?.sub || null);
                        updatedCount++;
                    }
                } else {
                    // Insert
                    // Construct address from components if not provided
                    if (!dbRow.address && (dbRow.street || dbRow.city)) {
                        const parts = [dbRow.street, dbRow.number, dbRow.neighborhood, dbRow.city, dbRow.state]
                            .filter(p => p)
                            .join(', ');
                        dbRow.address = parts || null;
                    }

                    // Use site_id as name if not provided
                    if (!dbRow.name) {
                        dbRow.name = dbRow.site_id;
                    }

                    const columns = Object.keys(dbRow);
                    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
                    const values = columns.map(col => dbRow[col]);

                    const insertResult = await client.query(
                        `INSERT INTO erbs (${columns.join(', ')}) VALUES (${placeholders})`,
                        values
                    );
                    await logErbChange(insertResult.rows[0]?.id || null, 'IMPORT', null, dbRow, req.user?.sub || null);
                    insertedCount++;
                }
            } catch (rowErr) {
                errors.push(`Row ${idx + 1}: ${rowErr.message}`);
            }
        }

        await client.query('COMMIT');
        
        const response = { 
            message: 'Import completed', 
            inserted: insertedCount, 
            updated: updatedCount,
            skipped: errors.length 
        };
        
        if (errors.length > 0) {
            response.errors = errors.slice(0, 10); // Return first 10 errors
        }
        
        res.json(response);

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
