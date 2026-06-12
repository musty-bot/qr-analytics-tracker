const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

const init = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS qr_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      qr_id TEXT UNIQUE NOT NULL,
      original_url TEXT,
      qr_url TEXT,
      short_code TEXT UNIQUE NOT NULL,
      title TEXT,
      total_clicks INTEGER DEFAULT 0,
      payment_type TEXT,
      qr_type TEXT,
      amount REAL,
      paybill_number TEXT,
      till_number TEXT,
      pochi_number TEXT,
      reference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`ALTER TABLE qr_codes ADD COLUMN qr_type TEXT`, (err) => {
      if (err && !err.message.includes('duplicate')) {
        console.error('Migration error:', err.message);
      }
    });

    db.run(`CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      qr_id INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      device_type TEXT,
      browser_name TEXT,
      browser_version TEXT,
      os_name TEXT,
      country TEXT,
      city TEXT,
      referer TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (qr_id) REFERENCES qr_codes(id)
    )`);
  });
};

module.exports = { db, init };
