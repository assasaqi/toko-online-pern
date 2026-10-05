import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading, error }) {
    // 1. Tampilan saat data sedang dimuat (Loading State)
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3"></div>
                <p className="text-sm font-medium">Memuat data produk...</p>
            </div>
        );
    }

    // 2. Tampilan saat terjadi kesalahan koneksi/server (Error State)
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center my-6 text-sm">
                {error}
            </div>
        );
    }

    // 3. Tampilan saat data produk kosong (Empty State)
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-gray-100 p-8 my-6">
                <p className="text-base font-semibold text-gray-700">Tidak ada produk ditemukan.</p>
                <p className="text-xs text-gray-400 mt-1">Coba sesuaikan pencarian atau filter kategori kamu.</p>
            </div>
        );
    }

    // 4. Grid Katalog Produk
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
