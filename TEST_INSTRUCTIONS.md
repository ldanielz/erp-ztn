# Testing Instructions — Pagination, Rate Limiting, Audit History & Raw Import Storage

## Overview

This document describes the recent enhancements to the ERB module:

1. **Pagination**: GET `/api/erbs` now supports `page` and `limit` query parameters
2. **Rate Limiting**: Per-endpoint rate limiters protect write and import endpoints
3. **Audit History with Diffs**: ERB details dialog displays change history with only changed fields highlighted
4. **Raw Import Storage**: Original Excel rows stored in `raw_import` JSONB column for audit trail

## Backend Setup

### Prerequisites

- Node.js v20+
- PostgreSQL with `erp_ztn` database
- Environment variables:
  - `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://dbuser:password@localhost:5432/erp_ztn`)
  - `JWT_SECRET`: Strong secret key (≥32 characters, e.g., `"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`)

### Start Backend

```bash
cd /home/ldani/Projects/erp-ztn/server
export JWT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export DATABASE_URL="postgresql://dbuser:password@localhost:5432/erp_ztn"
npm install
npm run dev
```

Expected output:
```
Server running on port 4000
Database initialized
```

The backend will automatically:
- Create/update `erbs` table with new `raw_import JSONB` column
- Create `erb_audit_log` table if not present
- Apply migrations for existing databases

## Frontend Setup

### Start Frontend

```bash
cd /home/ldani/Projects/erp-ztn/client
npm install
npm run dev
```

Open browser at http://localhost:5173 (or displayed Vite URL)

## Testing Workflows

### 1. Test Pagination

1. **Login** with admin credentials
2. Navigate to **ERBs (Infraestrutura)** page
3. Verify the **Pagination control** appears at the bottom
4. Click page numbers or use dropdown to change limit
5. Confirm data changes and total count is displayed

**API Test (curl)**:
```bash
curl -s "http://localhost:4000/api/erbs?page=1&limit=5" \
  -H "Authorization: Bearer <your-jwt-token>"
```

Expected response:
```json
{
  "data": [...],
  "total": <total_count>,
  "page": 1,
  "limit": 5
}
```

### 2. Test Rate Limiting

Rate limits are enforced per endpoint:
- **Write operations** (POST, PUT, DELETE): 10 requests per minute
- **Import endpoint**: 5 requests per minute

**Test Write Rate Limit (curl)**:
```bash
for i in {1..12}; do
  curl -X POST "http://localhost:4000/api/erbs" \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d "{\"site_id\":\"TEST-$i\",\"latitude\":0,\"longitude\":0}"
done
```

You should see HTTP 429 (Too Many Requests) after ~10 requests.

### 3. Test Excel Import with Raw Data Storage

1. **Prepare Excel file** with Portuguese headers (or use the structure below):

   Headers: `SITE_ID`, `TIPO_DE_ELEMENTO`, `TECNOLOGIA`, `TIPO_DE_CONEXAO`, `CLASSIFICACAO`, `DATA_DE_ATIVACAO`, `DETENTOR`, `TIPO_DE_ESTRUTURA`, `LOGRADOURO`, `NUMERO`, `BAIRRO`, `MUNICIPIO`, `ESTADO`, `REGIONAL`, `LATITUDE`, `LONGITUDE`, `STATUS`, `END_CONSOLIDADO`

   Example row:
   ```
   RJMW22 | SCP | GSM | Interconexão | TRANSPORTE | 10-OCT-12 | INDEFINIDO | Próprio | DAS AMERICAS | 1245 | BARRA DA TIJUCA | RIO DE JANEIRO | RJ | TRJ | -23.002611 | -43.328056 | Desativado | AVENIDA DAS AMERICAS 1245 - BARRA DA TIJUCA
   ```

2. **Click "Importar"** button on the ERBs page
3. **Select the Excel file**
4. **Verify import result** (inserted/updated count displayed in notification)

**Database Verification** (psql):
```sql
SELECT id, site_id, equipment_type, city, raw_import 
FROM erbs 
WHERE site_id = 'RJMW22' 
LIMIT 1 \gx
```

You should see `raw_import` containing the original Excel row as JSON.

### 4. Test Audit History Details Dialog

1. **Navigate to ERBs list**
2. **Click the "Detalhes" icon (i)** on any ERB row
3. **Dialog opens** showing:
   - **Informações resumidas**: Key fields (Status, Latitude, Longitude, City) as chips
   - **Informações completas**: Full ERB JSON
   - **Dados originais do Excel (raw_import)**: Original Excel row (if imported)
   - **Histórico de Mudanças**: Change history with only **changed fields** displayed

4. **Verify diffs**:
   - Each history entry shows action, timestamp, and only changed fields
   - Changed fields display: "De: <old_value>" (gray) and "Para: <new_value>" (green)
   - Values are formatted: dates as timestamps, strings as text, objects as JSON

### 5. Test Update and Audit Logging

1. **Click edit (pencil icon)** on an ERB
2. **Modify a field** (e.g., change Equipment Type to "6G Tower (Updated)")
3. **Click Save**
4. **Click Details (i)** again
5. **Verify in history**: New UPDATE entry with only the changed field displayed

## Unit Tests

Run the basic integration tests:

```bash
cd /home/ldani/Projects/erp-ztn/server
export JWT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
npm test
```

Expected output (3 passing tests):
```
✓ create an ERB and return 201
✓ return paginated results with data, total, page, limit
✓ enforce per-endpoint write rate limiting
```

## Excel Column Mapping

The import now recognizes Portuguese column names and aliases:

| Excel Header | Database Column | Notes |
|---|---|---|
| SITE_ID, STATION_ID | site_id | Primary identifier |
| TIPO_DE_ELEMENTO, TIPO_DE_EQUIPAMENTO, TIPO_DA_TORRE | equipment_type | Equipment classification |
| TECNOLOGIA | technology | Cellular technology (GSM, etc.) |
| TIPO_DE_CONEXAO | connection_type | Connection type |
| CLASSIFICACAO | classification | Classification level |
| DATA_DE_ATIVACAO | activation_date | Activation date (parsed from various formats) |
| DETENTOR, DETENTOR_AREA, DETENTOR_INFRA | holder | Infrastructure holder |
| TIPO_DE_ESTRUTURA, TIPO_DE_INFRA | structure_type | Structure type (tower, pole, etc.) |
| LOGRADOURO | street | Street name |
| NUMERO | number | Address number |
| BAIRRO | neighborhood | Neighborhood |
| MUNICIPIO | city | City name |
| ESTADO | state | State code |
| REGIONAL | region | Regional code |
| LATITUDE | latitude | Geographic latitude |
| LONGITUDE | longitude | Geographic longitude |
| STATUS | status | Current status |
| END_CONSOLIDADO, ENDERECO_ID | address | Full address |

## Troubleshooting

### Server won't start on port 4000

```bash
# Kill existing process
lsof -ti:4000 | xargs kill -9
# Or use sudo if above fails
sudo lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs sudo kill -9
```

### Database migration issues

If you get "column does not exist" errors:
1. Ensure `DATABASE_URL` is set correctly
2. Check that the database user has ALTER TABLE permissions
3. Restart the server to re-run migrations

### Import fails with "Site ID already exists"

When updating an existing ERB via import:
- Only non-null/non-empty fields from Excel are updated
- `raw_import` is always updated with the new Excel row
- Audit log records both old and new values

### Raw Import is null

Ensure:
- Backend was restarted after schema migration
- Import was done via `POST /api/erbs/import` (not direct DB insert)
- Excel rows have the required columns mapped correctly

## Architecture Notes

### Pagination

- Query parameters: `page` (default 1) and `limit` (default 25)
- Response includes `total` count for calculating max pages
- Database uses LIMIT/OFFSET for efficient pagination

### Rate Limiting

- Uses `express-rate-limit` with in-memory store
- **writeLimiter**: 10 reqs/min per IP for POST/PUT/DELETE
- **importLimiter**: 5 reqs/min per IP for file uploads
- Returns HTTP 429 with "Too many requests" message

### Audit Log

- Stores: `action` (CREATE/UPDATE/DELETE/IMPORT), `old_values`, `new_values`, `changed_fields`
- `changed_fields` is auto-calculated if missing
- New values captured from database RETURNING clause for consistency
- User ID logged (from JWT `sub` claim) when available

### Raw Import Storage

- **Column**: `raw_import JSONB` in `erbs` table
- **Populated**: During import via `POST /api/erbs/import`
- **Preserved**: Survives updates (overwritten with latest import row)
- **Useful for**: Auditing, data lineage, rollback analysis

## Performance Considerations

- Pagination: O(1) LIMIT/OFFSET queries with index on `created_at`
- Rate limit: In-memory store suitable for single-instance deployments; consider Redis for multi-instance
- Audit log: Append-only table; consider archiving old records after 6-12 months
- Raw import: JSONB is indexed; queries on raw_import are reasonably fast

## Next Steps

- Add archive/purge policy for old audit logs
- Implement Redis-based rate limiting for distributed deployments
- Add full-text search on audit log for better traceability
- Consider adding "Rollback to previous version" feature using audit history
