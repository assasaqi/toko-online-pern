import express from 'express';
// Pastikan updateProfile dimasukkan ke dalam destructuring import dari controller
import { register, login, updateProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update-profile', verifyToken, updateProfile);

export default router;
