const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'data', 'pertek.db');

function getDb() {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('Gagal membuka DB:', err);
  });
  return db;
}

module.exports = { getDb };
