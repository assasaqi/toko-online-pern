import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

// Inisialisasi PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'toko_online_db',
  port: Number(process.env.DB_PORT) || 5432,
  max: 20, // Maksimal 20 koneksi simultan
  idleTimeoutMillis: 30000, // Tutup koneksi idle setelah 30 detik
  connectionTimeoutMillis: 2000, // Timeout koneksi 2 detik
});

// Event listener koneksi pool
pool.on('connect', () => {
  console.log('✅ Terkoneksi ke database PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error pada client PostgreSQL Pool:', err);
});

export default {
  /**
   * Eksekusi kueri tunggal langsung dari pool.
   * Pool secara otomatis mengambil dan melepas koneksi.
   */
  query: (text, params) => pool.query(text, params),

  /**
   * Ambil koneksi khusus dedicated untuk Transaksi SQL (BEGIN, COMMIT, ROLLBACK).
   */
  getConnection: async () => {
    const client = await pool.connect();

    return {
      // Jalankan kueri pada client dedicated ini
      query: (text, params) => client.query(text, params),

      // Pembungkus Transaksi SQL PostgreSQL
      beginTransaction: async () => {
        await client.query('BEGIN');
      },
      commit: async () => {
        await client.query('COMMIT');
      },
      rollback: async () => {
        try {
          await client.query('ROLLBACK');
        } catch (rbErr) {
          console.error('❌ Error saat mengeksekusi ROLLBACK:', rbErr.message);
        }
      },

      // Kembalikan koneksi ke pool secara aman
      release: () => {
        if (client) {
          client.release();
        }
      },
    };
  },

  // Akses langsung ke instance pool
  pool,
};
