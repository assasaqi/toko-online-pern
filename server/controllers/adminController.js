import express from 'express';
import { verifyAdmin } from '../middleware/auth.js';
import { getDashboardStats, getAllOrders, updateOrderStatus } from '../controllers/adminController.js';

const router = express.Router();

// Terapkan middleware otorisasi khusus admin
router.use(verifyAdmin);

// Endpoints
router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
