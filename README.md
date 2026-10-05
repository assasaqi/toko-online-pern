# 🛒 TokoOnline.id — Fullstack MERN E-Commerce Platform

Aplikasi E-Commerce modern berbasis **MERN Stack** (MySQL, Express.js, React, Node.js) yang dilengkapi dengan manajemen produk (CRUD), sistem autentikasi multi-role (Admin & Customer), pencarian dan filter kategori dinamis, keranjang belanja, hingga manajemen dan pemrosesan pesanan.

---

## 📑 Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Arsitektur & Teknologi](#-arsitektur--teknologi)
- [Struktur Proyek](#-struktur-proyek)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi & Konfigurasi](#-instalasi--konfigurasi)
- [Dokumentasi API](#-dokumentasi-api)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🛒 Pelanggan (Customer)
* **Katalog Produk Responsif**: Tampilan grid produk yang optimal baik di layar desktop maupun seluler (*mobile*).
* **Pencarian & Filter Kategori**: Pencarian produk secara *real-time* dan tombol filter kategori berformat *scroll horizontal* di mobile.
* **Keranjang Belanja**: Menambah, mengubah kuantitas (*qty*), serta mengosongkan item keranjang yang tersimpan di `localStorage`.
* **Checkout Pesanan**: Memproses belanjaan dan menyimpan riwayat transaksi secara rinci ke MySQL database.
* **Riwayat Pesanan**: Memantau status pesanan (e.g., `pending`, `paid`, `shipped`).

### ⚙️ Administrator (Admin)
* **Pendaftaran Dual-Role**: Mampu mendaftar dan masuk sebagai Pelanggan atau Admin.
* **Manajemen Produk (CRUD)**:
  * Tambah produk baru (nama, deskripsi, harga, stok, URL gambar, serta kategori).
  * Edit data produk yang sudah ada secara *real-time*.
  * Hapus produk dari katalog toko.
* **Kelola Pesanan Seluruh Pelanggan**: Melihat dan mengubah status pesanan pelanggan.
* **Autentikasi Aman**: Endpoint terlindungi menggunakan JWT Auth Middleware dan verifikasi hak akses Admin.

---

## 🛠️ Arsitektur & Teknologi

* **Frontend**: React.js (Vite), Tailwind CSS, Context API (`AuthContext`, `CartContext`).
* **Backend**: Node.js, Express.js (ES Modules).
* **Database**: MySQL (Dikelola melalui Laragon / phpMyAdmin / HeidiSQL).
* **Autentikasi**: JSON Web Token (JWT) & Bcrypt.js.

---

## 📂 Struktur Proyek

```text
toko-online/
├── client/                      # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/          # Navbar, ProductCard, ProductFilter, AdminProductModal, dll.
│   │   ├── context/             # AuthContext, CartContext
│   │   ├── App.jsx              # Komponen Utama UI & Fetching Data
│   │   └── main.jsx             # Entry Point React
│   ├── package.json
│   └── vite.config.js
│
└── server/                      # Backend (Node.js + Express)
    ├── config/                  # Konfigurasi Database MySQL (db.js)
    ├── controllers/             # Logic Controller (auth, product, order)
    ├── middleware/              # Auth & Admin Role Validation Middleware
    ├── routes/                  # Express Routes API
    ├── index.js                 # Server Entry Point
    └── package.json
