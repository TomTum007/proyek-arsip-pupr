// =================================================================
// BAGIAN 1: IMPOR & INISIALISASI
// =================================================================
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
// PERBAIKAN: Gunakan port dari hosting, atau 3000 jika di lokal
const PORT = process.env.PORT || 3000;

// =================================================================
// BAGIAN 2: MIDDLEWARE
// =================================================================
app.use(cors()); 
app.use(express.json()); 

// =================================================================
// BAGIAN 3: KONEKSI DATABASE
// =================================================================
// PERBAIKAN: Gunakan variabel koneksi dari hosting (Railway),
// atau gunakan info lokal jika variabel tersebut tidak ada.
const db = mysql.createPool({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'db_arsip_surat',
    port: process.env.MYSQLPORT || 3306
}).promise();

// =================================================================
// BAGIAN 4: API ENDPOINTS (RUTE LENGKAP)
// =================================================================

// GET: Mengambil SEMUA data surat
app.get('/api/surat', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM surat_keluar ORDER BY tanggal DESC');
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil data surat' });
    }
});

// GET: Mengambil SATU data surat berdasarkan ID
app.get('/api/surat/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('SELECT * FROM surat_keluar WHERE id = ?', [id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Surat tidak ditemukan' });
        }
        res.json(result[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil data surat' });
    }
});

// POST: Menambah data surat BARU
app.post('/api/surat', async (req, res) => {
    try {
        const { noAgenda, alamatTujuan, perihal, tanggal, bidang } = req.body;
        const query = 'INSERT INTO surat_keluar (no_agenda, alamat_tujuan, perihal, tanggal, bidang, terkunci) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(query, [noAgenda, alamatTujuan, perihal, tanggal, bidang, 0]);
        res.status(201).json({ message: 'Surat berhasil ditambahkan' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal menambah data surat' });
    }
});

// PUT: Mengubah data surat berdasarkan ID
app.put('/api/surat/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { alamatTujuan, perihal, tanggal, bidang } = req.body;
        const query = 'UPDATE surat_keluar SET alamat_tujuan = ?, perihal = ?, tanggal = ?, bidang = ? WHERE id = ?';
        await db.query(query, [alamatTujuan, perihal, tanggal, bidang, id]);
        res.json({ message: 'Surat berhasil diperbarui' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal memperbarui surat' });
    }
});

// PUT: Mengunci surat berdasarkan ID
app.put('/api/surat/lock/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE surat_keluar SET terkunci = 1 WHERE id = ?', [id]);
        res.json({ message: 'Surat berhasil dikunci' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengunci surat' });
    }
});

// PUT: Membuka kunci surat berdasarkan ID
app.put('/api/surat/unlock/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE surat_keluar SET terkunci = 0 WHERE id = ?', [id]);
        res.json({ message: 'Kunci surat berhasil dibuka' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal membuka kunci surat' });
    }
});

// DELETE: Menghapus data surat berdasarkan ID
app.delete('/api/surat/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM surat_keluar WHERE id = ?', [id]);
        res.json({ message: 'Surat berhasil dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal menghapus surat' });
    }
});

// =================================================================
// BAGIAN 5: MENYALAKAN SERVER
// =================================================================
app.listen(PORT, () => {
  console.log(`Server berjalan di port: ${PORT}`);
});