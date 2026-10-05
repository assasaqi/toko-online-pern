import React, { useState } from 'react';
import api from '../services/api';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../utils/formatters';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  // Handler penambahan kuantitas satu per satu secara aman
  const handleIncrease = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQty = parseInt(item.quantity || item.qty || 1, 10);
    updateQuantity(item.id, currentQty + 1);
  };

  // Handler pengurangan kuantitas
  const handleDecrease = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQty = parseInt(item.quantity || item.qty || 1, 10);
    if (currentQty > 1) {
      updateQuantity(item.id, currentQty - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  // Fungsi penanganan Checkout menggunakan Axios (api)
  const handleCheckout = async () => {
    if (!user || !token) {
      setMessage({
        type: 'error',
        text: 'Silakan masuk / login terlebih dahulu untuk melakukan checkout.',
      });
      return;
    }

    if (!cart || cart.length === 0) {
      setMessage({
        type: 'error',
        text: 'Keranjang belanja Anda masih kosong.',
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const currentTotalPrice =
      Number(totalPrice) ||
      cart.reduce(
        (acc, item) => acc + Number(item.harga) * (parseInt(item.quantity || item.qty, 10) || 1),
        0
      );

    const orderData = {
      totalPrice: currentTotalPrice,
      total_harga: currentTotalPrice,
      items: cart.map((item) => ({
        id: Number(item.id),
        product_id: Number(item.id),
        quantity: parseInt(item.quantity || item.qty, 10) || 1,
        kuantitas: parseInt(item.quantity || item.qty, 10) || 1,
        harga: Number(item.harga),
        harga_satuan: Number(item.harga),
      })),
    };

    try {
      // Menggunakan api.post alih-alih fetch
      // URL disesuaikan menjadi '/orders' (asumsi '/api' sudah ada pada baseURL)
      const response = await api.post('/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      setMessage({
        type: 'success',
        text: `Pesanan berhasil dibuat! ID Pesanan: #${data.orderId || data.order?.id || data.id}`,
      });
      clearCart();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Gagal memproses pesanan.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">

          {/* Header Drawer */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Keranjang Belanja
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pesan Notifikasi Sukses / Error */}
          {message.text && (
            <div
              className={`mx-4 mt-4 p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {message.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              )}
              <span className="flex-1">{message.text}</span>
            </div>
          )}

          {/* Body Daftar Produk */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-slate-600 font-semibold text-sm">Keranjang Anda kosong.</p>
                <p className="text-slate-400 text-xs mt-1">Pilih produk favorit Anda di katalog!</p>
              </div>
            ) : (
              cart.map((item) => {
                const currentQty = parseInt(item.quantity || item.qty, 10) || 1;
                const itemNama = item.nama_produk || item.nama || 'Produk';
                const itemGambar = item.gambar_url || item.gambar || '';

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3 hover:border-indigo-100 transition-all"
                  >
                    {/* Gambar Produk */}
                    <img
                      src={itemGambar}
                      alt={itemNama}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5-11 11"/></svg>';
                      }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-slate-100 bg-slate-50"
                    />

                    {/* Rincian Produk & Kontrol Kuantitas */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {itemNama}
                      </h4>
                      <p className="text-xs font-extrabold text-indigo-600 mt-0.5">
                        {formatRupiah(item.harga)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {/* Box Tombol + dan - */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                          <button
                            type="button"
                            onClick={(e) => handleDecrease(e, item)}
                            className="p-1 hover:bg-white text-slate-600 rounded-md transition-all active:scale-95"
                            title={currentQty === 1 ? 'Hapus item' : 'Kurangi kuantitas'}
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="px-2.5 text-xs font-bold text-slate-800 min-w-[24px] text-center select-none">
                            {currentQty}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleIncrease(e, item)}
                            className="p-1 hover:bg-white text-slate-600 rounded-md transition-all active:scale-95"
                            title="Tambah kuantitas"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Tombol Hapus Langsung */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus dari keranjang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ringkasan Pembayaran & Tombol Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 shrink-0 space-y-3">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">Total Pembayaran:</span>
                <span className="text-base sm:text-lg font-extrabold text-indigo-600">
                  {formatRupiah(
                    Number(totalPrice) ||
                      cart.reduce(
                        (acc, item) =>
                          acc + Number(item.harga) * (parseInt(item.quantity || item.qty, 10) || 1),
                        0
                      )
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Memproses Checkout...' : 'Lanjut ke Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="w-full text-xs text-slate-400 hover:text-red-600 text-center transition-colors py-1 font-medium"
              >
                Kosongkan Keranjang
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
