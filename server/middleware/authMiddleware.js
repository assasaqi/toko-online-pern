import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // Ambil token dari header Authorization (Format: "Bearer <TOKEN>")
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Token tidak ditemukan!',
        });
    }

    try {
        // Verifikasi token JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'rahasia_super_aman_123'
        );
        req.user = decoded; // Simpan data payload user ke req.user
        next(); // Lanjut ke controller/route berikutnya
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Token tidak valid atau sudah kedaluwarsa!',
        });
    }
};
