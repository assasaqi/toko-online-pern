# 🛒 Toko Online - PERN Stack

Aplikasi e-commerce berbasis **PERN Stack** (*PostgreSQL, Express.js, React, Node.js*) yang dilengkapi fitur manajemen produk, keranjang belanja, checkout, serta pengelolaan pesanan pelanggan dan admin.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, Tailwind CSS, Lucide React, Axios
* **Backend**: Node.js, Express.js
* **Database**: PostgreSQL
* **Authentication**: JSON Web Token (JWT)

---

## 📚 Dokumentasi Setup & Pembuatan Repositori Git

### 📌 1. Persiapan File `.gitignore`
Untuk mencegah terunggahnya kredensial rahasia dan folder dependensi yang besar, pastikan file `.gitignore` berisi:

```plaintext
node_modules/
client/node_modules/
server/node_modules/
.env
client/.env
server/.env
dist/
build/
*.log
