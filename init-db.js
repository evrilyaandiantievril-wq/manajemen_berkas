const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'pertek.db');
const SQL_FILE = path.join(__dirname, 'db', 'init.sql');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const sql = fs.readFileSync(SQL_FILE, 'utf8');

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) return console.error('Gagal membuka DB:', err);
  console.log('Membuat / mereset database di', DB_FILE);
  db.exec(sql, (err) => {
    if (err) console.error('Gagal menjalankan init.sql:', err);
    else console.log('Database berhasil diinisialisasi dan data sample dimasukkan.');
    db.close();
  });
});
