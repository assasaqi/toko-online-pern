import express from 'express';
import { verifyAdmin } from '../middleware/auth.js';
import { getDashboardStats, getAllOrders, updateOrderStatus } from '../controllers/adminDashboard.js';

const router = express.Router();

// Terapkan middleware otorisasi admin untuk semua route ini
router.use(verifyAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
