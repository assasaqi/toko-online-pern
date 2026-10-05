import express from 'express';
import {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
} from '../controllers/orderController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { verifyAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// ==========================================
// RUTE KHUSUS CUSTOMER (Memerlukan Token JWT)
// ==========================================

// POST /api/orders -> Membuat transaksi pesanan baru dari keranjang belanja
router.post('/', verifyToken, createOrder);

// GET /api/orders/my-orders -> Mengambil riwayat pesanan milik user yang sedang login
router.get('/my-orders', verifyToken, getUserOrders);

// ==========================================
// RUTE KHUSUS ADMIN (Memerlukan Token JWT & Role Admin)
// ==========================================

// GET /api/orders/admin/all -> Mengambil seluruh data pesanan semua pelanggan
router.get('/admin/all', verifyToken, verifyAdmin, getAllOrders);

// PUT /api/orders/admin/status/:id -> Memperbarui status pesanan (misal: 'paid', 'shipped', 'completed')
router.put('/admin/status/:id', verifyToken, verifyAdmin, updateOrderStatus);

export default router;
