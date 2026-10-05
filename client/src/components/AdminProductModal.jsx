import React, { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Package,
  Image as ImageIcon,
  DollarSign,
  Tag,
  FileText,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);
};

export default function AdminProductModal({ isOpen, onClose, onProductUpdated }) {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State Tab Mobile ('list' / 'form')
  const [activeTab, setActiveTab] = useState('list');

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [namaProduk, setNamaProduk] = useState('');
  const [kategori, setKategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [gambarUrl, setGambarUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  // 1. Fetch Produk menggunakan api.get
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      const data = response.data;
      const dataList = Array.isArray(data) ? data : data.data || data.products || [];
      setProducts(dataList);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Gagal memuat produk.'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNamaProduk('');
    setKategori('');
    setDeskripsi('');
    setHarga('');
    setStok('');
    setGambarUrl('');
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setNamaProduk(product.nama_produk || product.nama || '');
    setKategori(product.kategori || product.category || '');
    setDeskripsi(product.deskripsi || '');
    setHarga(product.harga || '');
    setStok(product.stok || '');
    setGambarUrl(product.gambar_url || product.gambar || '');
    setActiveTab('form');
  };

  // 2. Submit Produk (Tambah/Update) menggunakan api.post / api.put
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const isEdit = Boolean(editingId);
    const endpoint = isEdit ? `/products/${editingId}` : '/products';
    const payload = {
      nama_produk: namaProduk,
      nama: namaProduk,
      kategori: kategori || 'Umum',
      deskripsi,
      harga: Number(harga),
      stok: Number(stok),
      gambar_url: gambarUrl,
      gambar: gambarUrl,
    };

    const headers = {
      Authorization: `Bearer ${token || localStorage.getItem('token')}`
    };

    try {
      let response;
      if (isEdit) {
        response = await api.put(endpoint, payload, { headers });
      } else {
        response = await api.post(endpoint, payload, { headers });
      }

      const data = response.data;
      setMessage({ type: 'success', text: data.message || 'Produk berhasil disimpan!' });
      resetForm();
      fetchProducts();
      if (onProductUpdated) onProductUpdated();
      setActiveTab('list');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Gagal menyimpan produk.'
      });
    }
  };

  // 3. Hapus Produk menggunakan api.delete
  const handleDelete = async (id) => {
    if (!window.confirm(`Yakin ingin menghapus produk #${id}?`)) return;

    try {
      const response = await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('token')}`
        }
      });

      const data = response.data;
      setMessage({ type: 'success', text: data.message || 'Produk berhasil dihapus!' });
      fetchProducts();
      if (onProductUpdated) onProductUpdated();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Gagal menghapus produk.'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">

        {/* Header Modal */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-800">Manajemen Produk (Admin)</h2>
              <p className="text-xs text-slate-500 hidden sm:block">Tambah, Edit, dan Hapus produk katalog toko</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigasi Khusus Mobile */}
        <div className="flex md:hidden border-b border-slate-100 bg-slate-50 p-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Daftar Produk ({products.length})
          </button>
          <button
            onClick={() => { resetForm(); setActiveTab('form'); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'form' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            {editingId ? 'Edit Produk' : '+ Tambah Produk'}
          </button>
        </div>

        {/* Pesan Notifikasi Sukses / Error */}
        {message.text && (
          <div
            className={`mx-4 mt-4 p-3 rounded-2xl text-xs text-center font-medium transition-all ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Body Modal */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Form Tambah/Edit Produk */}
          <form
            onSubmit={handleSubmit}
            className={`bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-3 h-fit ${
              activeTab === 'form' ? 'block' : 'hidden md:block'
            }`}
          >
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
              {editingId ? <Edit2 className="w-4 h-4 text-indigo-600" /> : <Plus className="w-4 h-4 text-indigo-600" />}
              {editingId ? `Edit Produk #${editingId}` : 'Tambah Produk Baru'}
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Produk</label>
              <input
                type="text"
                required
                value={namaProduk}
                onChange={(e) => setNamaProduk(e.target.value)}
                placeholder="misal: Sepatu Sneaker"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kategori</label>
              <input
                type="text"
                required
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="misal: Pakaian, Parfum"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Deskripsi</label>
              <textarea
                rows="2"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Deskripsi singkat produk"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  placeholder="250000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Stok</label>
                <input
                  type="number"
                  required
                  value={stok}
                  onChange={(e) => setStok(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">URL Gambar</label>
              <input
                type="text"
                value={gambarUrl}
                onChange={(e) => setGambarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition-all"
              >
                {editingId ? 'Update Produk' : 'Simpan Produk'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { resetForm(); setActiveTab('list'); }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-3 py-2.5 rounded-xl text-xs transition-all"
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          {/* Daftar Produk */}
          <div className={`md:col-span-2 overflow-x-auto ${activeTab === 'list' ? 'block' : 'hidden md:block'}`}>
            {loading ? (
              <div className="text-center py-10 text-slate-400 text-xs">Memuat data produk...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">Belum ada produk.</div>
            ) : (
              <div className="space-y-3">
                {products.map((p) => {
                  const pNama = p.nama_produk || p.nama || 'Produk';
                  const pGambar = p.gambar_url || p.gambar || '';
                  const pKategori = p.kategori || p.category || 'Umum';

                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between gap-3 hover:border-indigo-100 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={pGambar}
                          alt={pNama}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5-11 11"/></svg>';
                          }}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100 bg-slate-50"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-800 truncate">{pNama}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded-md font-medium text-slate-600 mr-1.5">
                              {pKategori}
                            </span>
                            Stok: {p.stok}
                          </div>
                          <div className="text-xs font-bold text-indigo-600 mt-1">
                            {formatRupiah(p.harga)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
