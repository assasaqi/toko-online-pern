import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Menggunakan instance Axios terpusat

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(number) || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    return date.toLocaleDateString('id-ID', options);
};

const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
        case 'paid':
        case 'lunas':
            return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200 whitespace-nowrap shrink-0">Lunas</span>;
        case 'shipped':
        case 'dikirim':
            return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap shrink-0">Dikirim</span>;
        case 'completed':
        case 'selesai':
            return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap shrink-0">Selesai</span>;
        case 'cancelled':
        case 'dibatalkan':
            return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200 whitespace-nowrap shrink-0">Dibatalkan</span>;
        default:
            return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 whitespace-nowrap shrink-0">Menunggu Pembayaran</span>;
    }
};

export default function OrderHistory({ isOpen, onClose }) {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && token) {
            fetchOrders();
        }
    }, [isOpen, token]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/orders/my-orders', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = response.data;

            if (Array.isArray(data)) {
                setOrders(data);
            } else if (Array.isArray(data.data)) {
                setOrders(data.data);
            } else if (Array.isArray(data.orders)) {
                setOrders(data.orders);
            } else {
                setOrders([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Gagal memuat riwayat pesanan.');
        } finally {
            setLoading(false);
        }
    };

    const getTotalItemsCount = (order) => {
        if (!order) return 0;
        const itemList = order.items || order.order_items || order.details || order.OrderItems;
        if (Array.isArray(itemList) && itemList.length > 0) {
            return itemList.reduce((sum, item) => {
                const qty = parseInt(item.kuantitas || item.quantity || item.qty || item.jumlah || 1, 10);
                return sum + (isNaN(qty) ? 1 : qty);
            }, 0);
        }
        const directTotal = order.total_items ?? order.totalItems ?? order.total_quantity ?? order.totalQuantity ?? order.total_qty;
        if (directTotal !== undefined && directTotal !== null) {
            const parsed = parseInt(directTotal, 10);
            if (!isNaN(parsed) && parsed > 0) return parsed;
        }
        return order.item_count || order.itemCount || 1;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] relative">
                {/* Header Modal */}
                <div className="p-4 sm:p-5 border-b bg-gray-50 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Riwayat Pesanan</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Daftar transaksi belanja kamu</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 font-bold p-1 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content Pesanan */}
                <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 flex-1">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            Memuat data pesanan...
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 text-center">
                            {error}
                        </div>
                    ) : !Array.isArray(orders) || orders.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 flex flex-col items-center">
                            <span className="text-4xl mb-2">📦</span>
                            <p className="text-sm font-medium">Belum ada riwayat pesanan.</p>
                        </div>
                    ) : (
                        orders.map((order) => {
                            if (!order) return null;

                            const totalHarga = order.total_harga || order.totalPrice || order.total || 0;
                            const createdAt = order.created_at || order.createdAt || order.tanggal;
                            const itemCount = getTotalItemsCount(order);

                            const rawItems = order.items || order.order_items || [];
                            let parsedItems = [];
                            try {
                                parsedItems = typeof rawItems === 'string' ? JSON.parse(rawItems) : (Array.isArray(rawItems) ? rawItems : []);
                            } catch (e) {
                                parsedItems = [];
                            }

                            return (
                                <div
                                    key={order.id || Math.random()}
                                    className="border border-gray-200 rounded-xl p-3.5 sm:p-4 hover:shadow-sm transition-shadow bg-white"
                                >
                                    <div className="flex justify-between items-start mb-3 pb-2 gap-2 border-b border-gray-100">
                                        <div className="min-w-0">
                                            <span className="text-xs font-bold text-gray-800">
                                                ID Pesanan: {order.id || '-'}
                                            </span>
                                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                                {formatDate(createdAt)}
                                            </p>
                                        </div>
                                        <div className="shrink-0">{getStatusBadge(order.status)}</div>
                                    </div>

                                    {/* BLOK RINCIAN NAMA, KUANTITAS & HARGA BARANG (TAMPIL KESELURUHAN) */}
                                    <div className="space-y-2 my-3">
                                        <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-1">
                                            Nama Barang:
                                        </p>
                                        {parsedItems.length > 0 ? (
                                            parsedItems.map((item, idx) => {
                                                const qty = Number(item.kuantitas || item.quantity || item.qty || 1);
                                                const hargaSatuan = Number(item.harga_satuan || item.price || item.harga || 0);
                                                const subtotal = qty * hargaSatuan;

                                                return (
                                                    <div key={idx} className="flex justify-between items-center text-xs bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                                                        <div className="flex items-center gap-2 min-w-0 pr-2">
                                                            <span className="font-semibold text-slate-800 truncate">
                                                                {item.nama_produk || item.nama || `Produk #${item.product_id || item.id}`}
                                                            </span>
                                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-md shrink-0">
                                                                x{qty}
                                                            </span>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            {hargaSatuan > 0 && (
                                                                <p className="font-bold text-slate-700 text-xs">
                                                                    {formatRupiah(subtotal)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">Data rincian produk tidak tersedia.</p>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-2.5 mt-2">
                                        <span className="text-gray-500 font-medium">
                                            Total ({itemCount} Item)
                                        </span>
                                        <span className="font-bold text-indigo-600 text-sm">
                                            {formatRupiah(totalHarga)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
