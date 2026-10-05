import jwt from 'jsonwebtoken';

// Middleware untuk memverifikasi Token JWT & Role Admin
export const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_super_aman_123');

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Khusus untuk Admin!' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau telah kadaluwarsa.' });
  }
};

// Middleware opsional untuk memverifikasi pengguna yang sudah login (Customer / Admin)
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_super_aman_123');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token tidak valid.' });
  }
};

export default verifyAdmin;
