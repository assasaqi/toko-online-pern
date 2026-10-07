# 🛒 Toko Online PERN Stack

Aplikasi e-commerce berbasis web *full-stack* yang dibangun menggunakan **PERN Stack** (PostgreSQL, Express.js, React.js, Node.js). Repository ini terbagi menjadi dua bagian utama secara independen: **Client** (*frontend*) dan **Server** (*backend*).

---

## 🛠️ Tech Stack & Teknologi

### **Backend (`/server`)**
* **Runtime / Framework**: Node.js & Express.js
* **Database**: PostgreSQL
* **Driver Database**: `pg` (node-postgres)
* **Authentication**: JSON Web Token (JWT) & bcrypt / bcryptjs
* **Keamanan & Utilities**: CORS, dotenv

### **Frontend (`/client`)**
* **Framework / Build Tool**: React.js dengan Vite
* **Styling**: Tailwind CSS & PostCSS
* **Routing & Context**: React Router, Auth Context, Cart Context
* **HTTP Client**: Axios

---

## 📁 Struktur Repositori

```text
toko-online-pern/
├── client/                   # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/       # Komponen UI (Navbar, Modals, ProductGrid, dll.)
│   │   ├── context/          # State Management (AuthContext, CartContext)
│   │   ├── pages/            # Halaman (Home, Login, Register, Cart, Checkout, dll.)
│   │   ├── services/         # Axios API Service (`api.js`)
│   │   ├── utils/            # Helper & Formatters
│   │   ├── App.jsx           # Entry Point Routing React
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                   # Backend REST API (Node.js + Express)
    ├── config/               # Koneksi Database (`db.js`)
    ├── controllers/          # Logika Bisnis (Auth, Product, Order, Admin)
    ├── middleware/           # Auth & Admin Middleware
    ├── routes/               # API Endpoint Routes
    ├── index.js              # Entry Point Express Server
    └── package.json
```

---

## ⚙️ Fitur Utama

1. **Autentikasi & Otorisasi Pengguna**
   * Registrasi & Login Akun.
   * Manajemen Sesi menggunakan JWT (JSON Web Token).
   * Proteksi Rute (Role: User / Customer & Admin).

2. **Fitur Pelanggan (Client)**
   * Katalog Produk & Filter/Pencarian Produk.
   * Manajemen Keranjang Belanja (*Cart Drawer* & Halaman *Cart*).
   * Checkout & Riwayat Pesanan (*Order History*).
   * Edit Profil Pengguna.

3. **Fitur Admin**
   * Manajemen Produk (Tambah, Edit, Hapus Produk via Modal).
   * Pengelolaan Pesanan Pengguna (*Admin Order Modal*).

---

## 🚀 Panduan Instalasi & Cara Menjalankan

### 1. Prasyarat
* Node.js (v18+)
* PostgreSQL Database Server yang berjalan

---

### 2. Pengaturan Server (Backend)

1. Masuk ke folder `server`:
   ```bash
   cd server
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Buat file `.env` di folder `server` dan sesuaikan variabel lingkungan:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/nama_database
   JWT_SECRET=rahasia_jwt_anda
   ```

4. Jalankan server:
   ```bash
   npm run dev
   # Atau: npm start
   ```
   Server backend akan aktif di `http://localhost:5000`.

---

### 3. Pengaturan Client (Frontend)

1. Buka terminal baru, masuk ke folder `client`:
   ```bash
   cd client
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Buat file `.env` di folder `client` (jika diperlukan):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Jalankan aplikasi frontend:
   ```bash
   npm run dev
   ```
   Aplikasi client akan berjalan di `http://localhost:5173`.

---

## 🔗 Endpoint Utama API

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| **POST** | `/api/auth/register` | Pendaftaran akun baru | Publik |
| **POST** | `/api/auth/login` | Login pengguna | Publik |
| **GET** | `/api/products` | Mengambil daftar produk | Publik |
| **POST** | `/api/products` | Menambah produk baru | Admin |
| **PUT/DELETE** | `/api/products/:id` | Mengubah / menghapus produk | Admin |
| **POST** | `/api/orders` | Membuat pesanan baru | User Terautentikasi |
| **GET** | `/api/orders` | Mengambil daftar pesanan | User / Admin |
| **GET** | `/api/admin/orders` | Kelola seluruh pesanan | Admin |
