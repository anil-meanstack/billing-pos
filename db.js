// db.js (main process)
const Database = require("better-sqlite3");
const path = require("path");
const { app } = require("electron");

// Use app.getPath("userData") — works in dev & packaged
const dbPath = path.join(app.getPath("userData"), "pos.db");

const db = new Database(dbPath);

// Orders table
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    data TEXT,
    synced INTEGER DEFAULT 0
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT,
    slug TEXT
  );

  CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    image TEXT,
    category_id TEXT,
    category_name TEXT,
    base_price REAL,
    min_price REAL,
    max_price REAL,
    data TEXT
  );
`);

module.exports = db;