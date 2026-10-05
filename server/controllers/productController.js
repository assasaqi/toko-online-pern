import db from '../config/db.js';

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products ORDER BY id DESC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
    const { nama_produk, deskripsi, harga, stok, gambar_url, kategori } = req.body;

    if (!nama_produk || !harga || stok === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Nama produk, harga, dan stok wajib diisi!',
        });
    }

    try {
        const query = `
            INSERT INTO products (nama_produk, deskripsi, harga, stok, gambar_url, kategori)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;
        const values = [
            nama_produk,
            deskripsi || '',
            harga,
            stok,
            gambar_url || 'https://via.placeholder.com/150',
            kategori || 'Umum',
        ];

        const result = await db.query(query, values);
        const newProductId = result.rows[0].id;

        res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan!',
            productId: newProductId,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { nama_produk, deskripsi, harga, stok, gambar_url, kategori } = req.body;

    try {
        const query = `
            UPDATE products
            SET nama_produk = $1, deskripsi = $2, harga = $3, stok = $4, gambar_url = $5, kategori = $6
            WHERE id = $7
        `;
        const values = [
            nama_produk,
            deskripsi || '',
            harga,
            stok,
            gambar_url || '',
            kategori || 'Umum',
            id,
        ];

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
        }

        res.status(200).json({
            success: true,
            message: `Produk #${id} berhasil diperbarui!`,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM products WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
        }

        res.status(200).json({
            success: true,
            message: `Produk #${id} berhasil dihapus!`,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
