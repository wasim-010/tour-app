const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'tour_manager.db');
const backupDir = path.join(__dirname, 'db_backup');
const db = new sqlite3.Database(dbPath);

const tables = [
    'users',
    'groups',
    'users_groups',
    'tour_days',
    'deposits',
    'announcements',
    'push_tokens',
    'locations',
    'events',
    'expenses'
];

const bcrypt = require('bcryptjs');
const defaultPasswordHash = bcrypt.hashSync('tour123', 10);

async function getTableColumns(tableName) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(row => row.name));
        });
    });
}

async function importTable(tableName) {
    const filePath = path.join(backupDir, `${tableName}.json`);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${tableName}: File not found.`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data || data.length === 0) {
        console.log(`Skipping ${tableName}: No data.`);
        return;
    }

    const tableColumns = await getTableColumns(tableName);
    let columnsInBackup = Object.keys(data[0]);

    // Filter columns to only those that exist in the table
    let columnsToImport = columnsInBackup.filter(col => tableColumns.includes(col));

    // Special case for users table: ensure password_hash is set if missing from backup but present in table
    if (tableName === 'users' && tableColumns.includes('password_hash')) {
        if (!columnsToImport.includes('password_hash')) {
            columnsToImport.push('password_hash');
            data.forEach(row => row.password_hash = defaultPasswordHash);
        }
    }

    const placeholders = columnsToImport.map(() => '?').join(',');
    const sql = `INSERT OR REPLACE INTO ${tableName} (${columnsToImport.join(',')}) VALUES (${placeholders})`;

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare(sql);
            data.forEach(row => {
                const values = columnsToImport.map(col => row[col]);
                stmt.run(values);
            });
            stmt.finalize((err) => {
                if (err) {
                    console.error(`Error importing ${tableName}:`, err.message);
                    reject(err);
                } else {
                    console.log(`Imported ${data.length} rows into ${tableName}.`);
                    resolve();
                }
            });
        });
    });
}

async function runImport() {
    console.log('Starting data import from JSON backups...');
    try {
        for (const table of tables) {
            await importTable(table);
        }
        console.log('Data import completed successfully.');
    } catch (err) {
        console.error('Import failed:', err);
    } finally {
        db.close();
    }
}

runImport();
