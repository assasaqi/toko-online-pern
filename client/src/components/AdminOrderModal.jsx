import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(number) || 0);
};

export default function AdminOrderModal({ isOpen, onClose }) {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (isOpen && token) {
            fetchAllOrders();
        }
    }, [isOpen, token]);

    const fetchAllOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders/admin/all', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = response.data;
            setOrders(data.data || []);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Gagal memuat pesanan' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await api.put(`/orders/admin/status/${orderId}`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = response.data;
            setMessage({ type: 'success', text: data.message });
            setOrders((prev) =>
                prev.map((ord) =>
                    ord.id === orderId ? { ...ord, status: newStatus } : ord
                )
            );
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Gagal mengubah status' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header Modal */}
                <div className="p-5 border-b bg-gray-50 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Panel Kelola Pesanan (Admin)</h2>
                        <p className="text-xs text-gray-500">Ubah status transaksi pelanggan secara real-time</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold p-1">
                        ✕
                    </button>
                </div>

                {/* Notifikasi */}
                {message.text && (
                    <div
                        className={`m-4 p-3 rounded-xl text-xs text-center font-medium ${message.type === 'error'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-green-50 text-green-700 border border-green-200'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Tabel Pesanan */}
                <div className="p-5 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Memuat data pesanan...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Belum ada data transaksi.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-xs font-semibold text-gray-500 bg-gray-50">
                                        <th className="p-3">ID Order</th>
                                        <th className="p-3">Pelanggan</th>
                                        <th className="p-3">Rincian Barang & Harga</th>
                                        <th className="p-3">Total Pembayaran</th>
                                        <th className="p-3 text-center">Status & Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-xs text-gray-700">
                                    {orders.map((ord) => {
                                        const rawItems = ord.items || ord.order_items || [];
                                        let parsedItems = [];
                                        try {
                                            parsedItems = typeof rawItems === 'string' ? JSON.parse(rawItems) : (Array.isArray(rawItems) ? rawItems : []);
                                        } catch (e) {
                                            parsedItems = [];
                                        }

                                        return (
                                            <tr key={ord.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-3 font-bold align-top">#{ord.id}</td>
                                                <td className="p-3 align-top">
                                                    <div className="font-semibold">{ord.nama || ord.customer_nama}</div>
                                                    <div className="text-[11px] text-gray-400">{ord.email || ord.customer_email}</div>
                                                </td>

                                                {/* KOLOM RINCIAN BARANG + HARGA */}
                                                <td className="p-3 align-top min-w-[320px]">
                                                    {parsedItems.length > 0 ? (
                                                        <div className="space-y-1.5">
                                                            {parsedItems.map((item, idx) => {
                                                                const qty = Number(item.kuantitas || item.quantity || item.qty || 1);
                                                                const hargaSatuan = Number(item.harga_satuan || item.price || item.harga || 0);
                                                                const subtotal = qty * hargaSatuan;

                                                                return (
                                                                    <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between gap-2">
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="font-semibold text-slate-800 truncate">
                                                                                {item.nama_produk || item.nama || `Produk #${item.product_id || item.id}`}
                                                                            </p>
                                                                            <p className="text-[10px] text-slate-400">
                                                                                {formatRupiah(hargaSatuan)} / pcs
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right shrink-0">
                                                                            <span className="font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] inline-block mb-0.5">
                                                                                x{qty}
                                                                            </span>
                                                                            <p className="font-bold text-slate-700 text-[11px]">
                                                                                {formatRupiah(subtotal)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Rincian tidak tersedia</span>
                                                    )}
                                                </td>

                                                <td className="p-3 font-bold text-indigo-600 align-top">
                                                    {formatRupiah(ord.total_harga || ord.totalPrice)}
                                                </td>

                                                {/* STATUS & AKSI DIBUAT DENGAN MENU DROPDOWN */}
                                                <td className="p-3 text-center align-top">
                                                    <select
                                                        value={ord.status}
                                                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                                        className="bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 cursor-pointer shadow-sm"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="paid">Paid (Lunas)</option>
                                                        <option value="shipped">Shipped (Dikirim)</option>
                                                        <option value="completed">Completed (Selesai)</option>
                                                        <option value="cancelled">Cancelled (Batal)</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
