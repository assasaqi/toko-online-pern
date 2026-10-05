import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../utils/formatters';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

  const totalPrice = getTotalPrice ? getTotalPrice() : cart.reduce((acc, item) => acc + (Number(item.harga) * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-md mx-auto">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🛒
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Keranjang Belanja Kosong</h2>
          <p className="text-sm text-gray-500 mb-6">
            Anda belum menambahkan produk apa pun ke keranjang belanja.
          </p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm hover:shadow"
          >
            Mulai Belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Keranjang Belanja</h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Kosongkan Keranjang
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daftar Item Keranjang */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {cart.map((item) => {
            const namaProduk = item.nama_produk || item.nama || 'Produk';
            const gambarUrl = item.gambar_url || item.gambar || 'https://via.placeholder.com/150';
            const subtotal = Number(item.harga) * item.quantity;

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-gray-200 transition-colors"
              >
                {/* Gambar Produk */}
                <img
                  src={gambarUrl}
                  alt={namaProduk}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-gray-50 flex-shrink-0"
                />

                {/* Info Produk & Harga */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-800 truncate leading-tight">
                    {namaProduk}
                  </h3>
                  <span className="text-xs text-gray-400 block mt-0.5">
                    {formatRupiah(item.harga)} / item
                  </span>
                  <span className="text-xs font-bold text-indigo-600 block mt-1">
                    Subtotal: {formatRupiah(subtotal)}
                  </span>
                </div>

                {/* Kontrol Kuantitas & Hapus */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 text-xs transition-colors p-1"
                    title="Hapus Produk"
                  >
                    🗑️
                  </button>

                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-gray-800 bg-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= (item.stok || 99)}
                      className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ringkasan Belanja & Checkout */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-6">
            <h2 className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
              Ringkasan Belanja
            </h2>

            <div className="flex flex-col gap-2.5 text-xs text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Total Item</span>
                <span className="font-semibold text-gray-800">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)} produk
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Harga Produk</span>
                <span className="font-semibold text-gray-800">{formatRupiah(totalPrice)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">Total Pembayaran</span>
                <span className="text-base font-black text-indigo-600">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3 rounded-2xl text-xs sm:text-sm text-center block transition-all shadow-sm hover:shadow"
            >
              Lanjut ke Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
