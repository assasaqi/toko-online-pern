import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../utils/formatters';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    alamat: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalPrice = getTotalPrice
    ? getTotalPrice()
    : cart.reduce((acc, item) => acc + Number(item.harga) * item.quantity, 0);

  // Jika keranjang kosong, arahkan ke halaman utama/keranjang
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Keranjang Anda Kosong</h2>
          <p className="text-xs text-gray-500 mb-6">
            Tidak ada produk yang dapat diproses untuk checkout.
          </p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors"
          >
            Kembali Belanja
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Menyiapkan struktur payload yang sesuai dengan endpoint Express API
    const orderPayload = {
      customer: formData,
      total_harga: totalPrice,
      order_items: cart.map((item) => ({
        product_id: item.id,
        kuantitas: item.quantity,
        harga_satuan: Number(item.harga),
      })),
    };

    try {
      // POST ke Express REST API
      const response = await api.post('/orders', orderPayload);

      if (response.status === 200 || response.status === 201) {
        clearCart(); // Bersihkan keranjang setelah transaksi berhasil
        alert('Pesanan berhasil dibuat!');
        navigate('/orders/success', { state: { order: response.data } });
      }
    } catch (err) {
      console.error('Error submitting order:', err);
      setError(
        err.response?.data?.message || 'Gagal memproses pesanan. Silakan coba beberapa saat lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Checkout Pesanan</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulir Data Pengiriman */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">
            Informasi Pembeli & Pengiriman
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                required
                value={formData.nama}
                onChange={handleChange}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Telepon/WA</label>
              <input
                type="tel"
                name="telepon"
                required
                value={formData.telepon}
                onChange={handleChange}
                placeholder="081234567890"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="email@domain.com"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Lengkap Pengiriman</label>
            <textarea
              name="alamat"
              rows="3"
              required
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Jalan, Nomor Rumah, RT/RW, Kecamatan, Kota, Kode Pos"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* Ringkasan Rincian Produk & Tombol Konfirmasi */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-6">
            <h2 className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
              Rincian Pesanan
            </h2>

            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto mb-4 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-gray-800 truncate">
                      {item.nama_produk || item.nama}
                    </p>
                    <p className="text-gray-400">
                      {item.quantity} x {formatRupiah(item.harga)}
                    </p>
                  </div>
                  <span className="font-bold text-gray-800 flex-shrink-0">
                    {formatRupiah(Number(item.harga) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-bold text-gray-800">Total Biaya</span>
                <span className="text-sm sm:text-base font-black text-indigo-600">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 active:scale-[0.98] text-white font-bold py-3 rounded-2xl text-xs sm:text-sm text-center transition-all shadow-sm hover:shadow"
            >
              {loading ? 'Memproses Pesanan...' : 'Konfirmasi & Buat Pesanan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
