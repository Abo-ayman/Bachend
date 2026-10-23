const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'visitors.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    country TEXT,
    city TEXT,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    language TEXT,
    screen_size TEXT,
    timezone TEXT,
    referrer TEXT,
    page TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

module.exports = db;
