import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 1. REGISTRASI PENGGUNA BARU
export const register = async (req, res) => {
    const { nama, email, password, role = 'customer' } = req.body;

    // Validasi input
    if (!nama || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Semua kolom (nama, email, password) wajib diisi!',
        });
    }

    // Validasi role (hanya boleh 'customer' atau 'admin')
    const validRoles = ['customer', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'customer';

    try {
        // Cek apakah email sudah terdaftar di database
        const existingUserResult = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUserResult.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
            });
        }

        // Encrypt / Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan pengguna baru ke tabel users dengan RETURNING id
        const insertQuery = `
            INSERT INTO users (nama, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        const result = await db.query(insertQuery, [nama, email, hashedPassword, userRole]);
        const newUserId = result.rows[0].id;

        res.status(201).json({
            success: true,
            message: `Registrasi berhasil sebagai ${userRole}! Silakan login.`,
            userId: newUserId,
        });
    } catch (error) {
        console.error('Error pada registrasi:', error.message);
        res.status(500).json({
            success: false,
            message: 'Gagal melakukan registrasi.',
            error: error.message,
        });
    }
};

// 2. LOGIN PENGGUNA
export const login = async (req, res) => {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email dan password wajib diisi!',
        });
    }

    try {
        // Cari user berdasarkan email
        const userResult = await db.query(
            'SELECT id, nama, email, password, role FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Email atau password salah!',
            });
        }

        const user = userResult.rows[0];

        // Cocokkan password plain dengan hash password di DB
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah!',
            });
        }

        // Buat JWT Token
        const token = jwt.sign(
            {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role, // Memasukkan role ke dalam payload JWT
            },
            process.env.JWT_SECRET || 'rahasia_super_aman_123',
            { expiresIn: '1d' } // Token berlaku selama 1 hari
        );

        res.status(200).json({
            success: true,
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error pada login:', error.message);
        res.status(500).json({
            success: false,
            message: 'Gagal melakukan login.',
            error: error.message,
        });
    }
};

// 3. UPDATE NAMA & PASSWORD USER
export const updateProfile = async (req, res) => {
    const userId = req.user.id; // Diambil dari middleware autentikasi (JWT)
    const { nama, passwordLama, passwordBaru } = req.body;

    if (!nama) {
        return res.status(400).json({
            success: false,
            message: 'Nama wajib diisi!',
        });
    }

    try {
        // Ambil data user saat ini dari database
        const userResult = await db.query(
            'SELECT id, password FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pengguna tidak ditemukan!',
            });
        }

        const user = userResult.rows[0];

        // Jika user ingin mengubah password
        let hashedPassword = user.password;
        if (passwordBaru) {
            if (!passwordLama) {
                return res.status(400).json({
                    success: false,
                    message: 'Password lama wajib diisi untuk mengubah password!',
                });
            }

            // Verifikasi password lama
            const isMatch = await bcrypt.compare(passwordLama, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Password lama salah!',
                });
            }

            // Hash password baru
            hashedPassword = await bcrypt.hash(passwordBaru, 10);
        }

        // Update data di database
        const updateQuery = `
            UPDATE users
            SET nama = $1, password = $2
            WHERE id = $3
            RETURNING id, nama, email, role
        `;
        const updatedResult = await db.query(updateQuery, [nama, hashedPassword, userId]);
        const updatedUser = updatedResult.rows[0];

        res.status(200).json({
            success: true,
            message: 'Profil berhasil diperbarui!',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error update profil:', error.message);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui profil.',
            error: error.message,
        });
    }
};
