import React from 'react';
import PropTypes from 'prop-types';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../utils/formatters'; // Import dari file utils

export default function ProductCard({ product }) {
    const { addToCart } = useCart();

    // Proteksi jika data product belum/tidak dimuat
    if (!product) return null;

    // Normalisasi properti
    const namaProduk = product.nama_produk || product.nama || 'Produk Tanpa Nama';
    const kategori = product.kategori || product.nama_kategori || product.category || 'Umum';
    const gambarUrl = product.gambar_url || product.gambar || 'https://via.placeholder.com/300';
    const deskripsi = product.deskripsi || 'Tidak ada deskripsi tersedia.';
    const stok = Number(product.stok) || 0;
    const isOutOfStock = stok <= 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
            {/* Gambar Produk & Overlay Stok */}
            <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                <img
                    src={gambarUrl}
                    alt={namaProduk}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
                    }`}
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300?text=Gambar+Tidak+Tersedia';
                    }}
                />

                {/* Badge Overlay jika stok habis */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                            Stok Habis
                        </span>
                    </div>
                )}
            </div>

            {/* Konten Produk Ringkas & Padat */}
            <div className="p-3 flex flex-col justify-between flex-1 gap-1.5">
                <div>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mb-1">
                        {kategori}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-800 line-clamp-1 leading-tight group-hover:text-indigo-600 transition-colors">
                        {namaProduk}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-tight">
                        {deskripsi}
                    </p>
                </div>

                {/* Blok Harga, Stok, & Tombol */}
                <div className="pt-1.5 border-t border-gray-100 mt-1">
                    <div className="flex flex-col gap-0 mb-1.5">
                        <span className="text-xs sm:text-sm font-black text-indigo-600 truncate leading-tight">
                            {formatRupiah(product.harga)}
                        </span>
                        <span
                            className={`text-[10px] font-medium leading-none ${
                                isOutOfStock ? 'text-red-500' : 'text-gray-400'
                            }`}
                        >
                            {isOutOfStock ? 'Stok Tidak Tersedia' : `Stok: ${stok}`}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock}
                        className={`w-full font-semibold py-1.5 rounded-xl text-xs transition-all ${
                            isOutOfStock
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-sm hover:shadow'
                        }`}
                    >
                        {!isOutOfStock ? '+ Keranjang' : 'Habis'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Validasi Tipe Properti Component (opsional jika tidak pakai library prop-types)
ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        nama_produk: PropTypes.string,
        nama: PropTypes.string,
        harga: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        stok: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        gambar_url: PropTypes.string,
        gambar: PropTypes.string,
        deskripsi: PropTypes.string,
        kategori: PropTypes.string,
        nama_kategori: PropTypes.string,
        category: PropTypes.string,
    }),
};
