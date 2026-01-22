const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: GET /api/files
// Query params:
// - query: string untuk pencarian (search across multiple fields)
// - page, limit: pagination
// - sort: column name (opsional)
app.get('/api/files', (req, res) => {
  const q = (req.query.query || '').trim();
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10')));
  const offset = (page - 1) * limit;
  const sort = req.query.sort || 'id';
  const allowedSort = ['id','nomor','tanggal_directur','perusahaan','desa','kecamatan','luas','peruntukan'];
  const sortSafe = allowedSort.includes(sort) ? sort : 'id';

  const db = getDb();

  const baseCountSQL = 'SELECT COUNT(*) as total FROM berkas_pertek';
  const baseSearchSQL = `
    SELECT id, nomor, tanggal_directur, perusahaan, desa, kecamatan, luas, peruntukan
    FROM berkas_pertek
  `;

  if (!q) {
    db.get(baseCountSQL, [], (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'DB error', details: err.message });
      }
      const total = row.total || 0;
      const sql = `${baseSearchSQL} ORDER BY ${sortSafe} LIMIT ? OFFSET ?`;
      db.all(sql, [limit, offset], (err, rows) => {
        db.close();
        if (err) return res.status(500).json({ error: 'DB error', details: err.message });
        res.json({ data: rows, page, limit, total });
      });
    });
  } else {
    // Parameterized LIKE on multiple columns
    const term = `%${q}%`;
    const where = `
      WHERE nomor LIKE ? OR tanggal_directur LIKE ? OR perusahaan LIKE ?
      OR desa LIKE ? OR kecamatan LIKE ? OR peruntukan LIKE ?
      OR CAST(luas AS TEXT) LIKE ?
    `;
    const params = [term, term, term, term, term, term, term];

    db.get(`${baseCountSQL} ${where}`, params, (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'DB error', details: err.message });
      }
      const total = row.total || 0;
      const sql = `${baseSearchSQL} ${where} ORDER BY ${sortSafe} LIMIT ? OFFSET ?`;
      db.all(sql, params.concat([limit, offset]), (err, rows) => {
        db.close();
        if (err) return res.status(500).json({ error: 'DB error', details: err.message });
        res.json({ data: rows, page, limit, total });
      });
    });
  }
});

// API: GET /api/suggest?q=...
// Mengembalikan suggestion (perusahaan & desa) yang cocok
app.get('/api/suggest', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ suggestions: [] });

  const term = `%${q}%`;
  const db = getDb();
  const sql = `
    SELECT perusahaan AS text, 'perusahaan' as type FROM berkas_pertek WHERE perusahaan LIKE ?
    UNION
    SELECT desa AS text, 'desa' as type FROM berkas_pertek WHERE desa LIKE ?
    UNION
    SELECT peruntukan AS text, 'peruntukan' as type FROM berkas_pertek WHERE peruntukan LIKE ?
    LIMIT 10
  `;
  db.all(sql, [term, term, term], (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    // dedup
    const seen = new Set();
    const suggestions = [];
    for (const r of rows) {
      if (!seen.has(r.text)) {
        suggestions.push(r);
        seen.add(r.text);
      }
    }
    res.json({ suggestions });
  });
});

// fallback to index.html for SPA routing (if needed)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
