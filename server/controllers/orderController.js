import db from '../config/db.js';

// 1. MEMBUAT PESANAN BARU (CHECKOUT)
export const createOrder = async (req, res) => {
    console.log('--- Menerima Request Checkout ---');
    console.log('Payload Data:', JSON.stringify(req.body, null, 2));

    const userId = req.user?.id;
    const { items, totalPrice } = req.body;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Pengguna belum terautentikasi.',
        });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Keranjang belanja kosong atau format data tidak valid!',
        });
    }

    if (!totalPrice || isNaN(totalPrice) || Number(totalPrice) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Total harga tidak valid!',
        });
    }

    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const orderQuery = `
            INSERT INTO orders (user_id, total_harga, status)
            VALUES ($1, $2, $3)
            RETURNING id, created_at;
        `;
        const orderResult = await connection.query(orderQuery, [userId, Number(totalPrice), 'pending']);
        const orderId = orderResult.rows[0].id;

        for (const item of items) {
            const productId = item.id || item.product_id;
            const quantity = Number(item.quantity || item.qty || item.kuantitas);
            const price = Number(item.harga || item.harga_satuan);

            if (!productId || !quantity || !price) {
                throw new Error('Detail item produk tidak lengkap (id, quantity, atau harga hilang).');
            }

            await connection.query(
                `INSERT INTO order_items (order_id, product_id, kuantitas, harga_satuan)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, productId, quantity, price]
            );

            const updateStokResult = await connection.query(
                `UPDATE products
                 SET stok = stok - $1
                 WHERE id = $2 AND stok >= $1`,
                [quantity, productId]
            );

            if (updateStokResult.rowCount === 0) {
                throw new Error(`Stok produk dengan ID #${productId} tidak mencukupi atau produk tidak ditemukan.`);
            }
        }

        await connection.commit();
        console.log(`Checkout Sukses! Order ID: #${orderId}`);

        return res.status(201).json({
            success: true,
            message: 'Pesanan berhasil dibuat!',
            orderId,
            createdAt: orderResult.rows[0].created_at,
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error pada proses checkout:', error.message);

        return res.status(500).json({
            success: false,
            message: error.message || 'Gagal memproses pesanan.',
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// 2. MENGAMBIL RIWAYAT PESANAN MILIK USER (PERBAIKAN AGREGASI ITEMS)
// Function getUserOrders di orderController.js
export const getUserOrders = async (req, res) => {
  const userId = req.user?.id;

  try {
    const query = `
      SELECT
        o.id,
        o.total_harga,
        o.status,
        o.created_at,
        COALESCE(SUM(oi.kuantitas), 0)::INT AS total_items,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', oi.id,
              'product_id', oi.product_id,
              'nama_produk', COALESCE(p.nama_produk, 'Produk #' || oi.product_id),
              'kuantitas', oi.kuantitas,
              'harga_satuan', oi.harga_satuan,
              'gambar_url', p.gambar_url
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id, o.total_harga, o.status, o.created_at
      ORDER BY o.created_at DESC
    `;
    const result = await db.query(query, [userId]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error mengambil riwayat pesanan:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data riwayat pesanan.',
      error: error.message,
    });
  }
};

// 3. MENGAMBIL DETAIL SATU PESANAN SPESIFIK
export const getOrderById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    try {
        const orderQuery = `
            SELECT o.id, o.user_id, o.total_harga, o.status, o.created_at,
                   u.nama AS customer_nama, u.email AS customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `;
        const orderResult = await db.query(orderQuery, [id]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan.',
            });
        }

        const order = orderResult.rows[0];

        if (order.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Anda tidak memiliki izin untuk melihat pesanan ini.',
            });
        }

        const itemsQuery = `
            SELECT oi.id, oi.product_id, oi.kuantitas, oi.harga_satuan,
                   COALESCE(p.nama_produk, 'Produk #' || oi.product_id) AS nama_produk, p.gambar_url
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        `;
        const itemsResult = await db.query(itemsQuery, [id]);

        res.status(200).json({
            success: true,
            data: {
                ...order,
                items: itemsResult.rows,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. AMBIL SEMUA PESANAN (KHUSUS ADMIN)
export const getAllOrders = async (req, res) => {
    try {
        const query = `
            SELECT
                o.id,
                o.total_harga,
                o.status,
                o.created_at,
                u.nama,
                u.email,
                COALESCE(SUM(oi.kuantitas), 0)::INT AS total_items,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', oi.id,
                            'product_id', oi.product_id,
                            'nama_produk', COALESCE(p.nama_produk, 'Produk #' || oi.product_id),
                            'kuantitas', oi.kuantitas,
                            'harga_satuan', oi.harga_satuan
                        )
                    ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
                ) AS items
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            GROUP BY o.id, o.total_harga, o.status, o.created_at, u.nama, u.email
            ORDER BY o.created_at DESC
        `;
        const result = await db.query(query);

        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. UPDATE STATUS PESANAN (KHUSUS ADMIN)
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status pesanan tidak valid!',
        });
    }

    try {
        const query = 'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *';
        const result = await db.query(query, [status, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan.',
            });
        }

        res.status(200).json({
            success: true,
            message: `Status pesanan #${id} berhasil diperbarui menjadi ${status}.`,
            order: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
