import Database from 'better-sqlite3';

const db = new Database('src/data/dev.db');
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'staff',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

export default db;