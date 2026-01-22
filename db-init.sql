-- Schema untuk tabel berkas_pertek
DROP TABLE IF EXISTS berkas_pertek;
CREATE TABLE berkas_pertek (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor TEXT NOT NULL,
  tanggal_directur TEXT NOT NULL, -- gunakan ISO YYYY-MM-DD
  perusahaan TEXT NOT NULL,
  desa TEXT NOT NULL,
  kecamatan TEXT NOT NULL,
  luas REAL NOT NULL,
  peruntukan TEXT NOT NULL
);

-- Data contoh (seed)
INSERT INTO berkas_pertek (nomor, tanggal_directur, perusahaan, desa, kecamatan, luas, peruntukan) VALUES
('PTK-2024-001', '2024-01-15', 'PT. Agro Makmur', 'Desa Suka Maju', 'Kecamatan Merdeka', 5.2, 'Pertanian'),
('PTK-2024-002', '2024-02-03', 'CV. Bina Jaya', 'Desa Makmur', 'Kecamatan Sejahtera', 2.5, 'Perumahan'),
('PTK-2024-003', '2024-02-20', 'PT. Agro Makmur', 'Desa Suka Maju', 'Kecamatan Merdeka', 10.0, 'Tambak'),
('PTK-2024-004', '2024-03-05', 'UD. Maju Bersama', 'Desa Harapan', 'Kecamatan Sentosa', 1.25, 'Usaha Mikro'),
('PTK-2024-005', '2024-03-25', 'PT. Hijau Lestari', 'Desa Hijau', 'Kecamatan Sehat', 12.8, 'Perkebunan'),
('PTK-2024-006', '2024-04-10', 'PT. Cahaya Nusantara', 'Desa Makmur', 'Kecamatan Sejahtera', 3.75, 'Perumahan'),
('PTK-2024-007', '2024-05-01', 'CV. Bina Jaya', 'Desa Harapan', 'Kecamatan Sentosa', 4.0, 'Industri Ringan'),
('PTK-2024-008', '2024-06-07', 'PT. Agro Makmur', 'Desa Subur', 'Kecamatan Makmur', 8.6, 'Pertanian'),
('PTK-2024-009', '2024-07-12', 'PT. Cahaya Nusantara', 'Desa Subur', 'Kecamatan Makmur', 6.3, 'Perkebunan'),
('PTK-2024-010', '2024-08-18', 'UD. Maju Bersama', 'Desa Suka Maju', 'Kecamatan Merdeka', 0.9, 'Rumah Tinggal');
