// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'tour_manager.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("FATAL: Database connection error:", err.message);
    else console.log("Database connected. All routes will share this connection.");
});
db.run('PRAGMA foreign_keys = ON;', (err) => { if (err) console.error("Could not enable foreign keys:", err); });
const runAsync = (sql, params = []) => new Promise((resolve, reject) => { db.run(sql, params, function (err) { if (err) reject(err); else resolve(this); }); });
const allAsync = (sql, params = []) => new Promise((resolve, reject) => { db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); }); });
const getAsync = (sql, params = []) => new Promise((resolve, reject) => { db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); }); });
module.exports = { runAsync, allAsync, getAsync };