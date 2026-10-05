import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import { Search, Filter, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // State Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  useEffect(() => {
    fetchProducts();
  }, []);

 const fetchProducts = async () => {
    setLoading(true);
    try {
      // Ganti baris yang error dengan ini:
      const res = await api.get('/products');

      const dataList = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.products || [];

      setProducts(dataList);
      setFilteredProducts(dataList);
    } catch (err) {
      console.error('Gagal mengambil data produk:', err);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Logika Filter & Search
  useEffect(() => {
    let result = Array.isArray(products) ? products : [];

    // Filter Pencarian
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const nama = (p.nama_produk || p.nama || '').toLowerCase();
        const deskripsi = (p.deskripsi || '').toLowerCase();
        return nama.includes(query) || deskripsi.includes(query);
      });
    }

    // Filter Kategori
    if (selectedCategory !== 'Semua') {
      result = result.filter((p) => {
        const kat = p.kategori || p.category || '';
        return kat.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

  // Daftar Kategori Unik
  const categories = [
    'Semua',
    ...new Set(
      (Array.isArray(products) ? products : [])
        .map((p) => p.kategori || p.category)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Navigation */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Banner Promo */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-12 text-white shadow-xl shadow-indigo-100">
          <h1 className="text-2xl sm:text-5xl font-extrabold tracking-tight mb-2 sm:mb-4">
            Selamat Datang di TokoOnline.id
          </h1>
          <p className="text-indigo-100 text-xs sm:text-lg max-w-2xl">
            Temukan berbagai produk pilihan terbaik dengan harga terjangkau dan kualitas terjamin.
          </p>
        </div>

        {/* Control Bar: Pencarian & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-sm">

          {/* Input Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 transition-all outline-none"
            />
          </div>

          {/* Dropdown Kategori */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Katalog Produk Header */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800">
                Katalog Produk
                <span className="ml-2 text-xs font-normal text-slate-500">
                  ({filteredProducts.length} produk)
                </span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm">Pilih produk favorit Anda</p>
            </div>
          </div>

          {/* Grid Produk: 2 Kolom di Mobile (`grid-cols-2`), 3 di Tablet, 4 di Desktop */}
          {loading ? (
            <div className="text-center py-20 text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              <span>Memuat produk...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
              <p className="text-slate-500 text-xs sm:text-sm font-medium">Belum ada produk yang sesuai.</p>
              <p className="text-[11px] text-slate-400 mt-1">Coba kata kunci pencarian atau kategori lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Slide-over Keranjang */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
