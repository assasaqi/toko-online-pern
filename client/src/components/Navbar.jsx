import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  Settings,
  ClipboardList,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import OrderHistory from './OrderHistory';
import AdminOrderModal from './AdminOrderModal';
import AdminProductModal from './AdminProductModal';
import EditProfileModal from './EditProfileModal';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
    const [isAdminOrderOpen, setIsAdminOrderOpen] = useState(false);
    const [isAdminProductOpen, setIsAdminProductOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm w-full relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-black text-indigo-600 tracking-tight shrink-0">
                        <div className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <span className="truncate">TokoOnline<span className="text-slate-800">.id</span></span>
                    </Link>

                    {/* Navigasi Desktop & Aksi Cepat Mobile */}
                    <div className="flex items-center gap-2">

                        {/* Tombol Keranjang Belanja */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                            title="Keranjang Belanja"
                        >
                            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                            {totalItems > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        {/* Desktop Menu */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-2">
                                {/* Tombol Riwayat Pesanan (Ditampilkan untuk SEMUA user, termasuk Admin) */}
                                <button
                                    onClick={() => setIsOrderHistoryOpen(true)}
                                    className="text-xs font-semibold text-slate-700 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                                >
                                    <ClipboardList className="w-4 h-4 text-slate-500" />
                                    <span>Riwayat Pesanan</span>
                                </button>

                                {user.role === 'admin' && (
                                    /* Tombol Tambahan Khusus Admin */
                                    <>
                                        <button
                                            onClick={() => setIsAdminProductOpen(true)}
                                            className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                                        >
                                            <Package className="w-4 h-4" />
                                            <span>Kelola Produk</span>
                                        </button>

                                        <button
                                            onClick={() => setIsAdminOrderOpen(true)}
                                            className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Kelola Pesanan</span>
                                        </button>
                                    </>
                                )}

                                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                                    <button
                                        onClick={() => setIsEditProfileOpen(true)}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all"
                                    >
                                        <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <User className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-semibold text-slate-800 max-w-[100px] truncate">{user.nama}</span>
                                        {user.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
                                    </button>

                                    <button
                                        onClick={logout}
                                        className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all flex items-center gap-1"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Keluar</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all items-center gap-1.5"
                            >
                                <User className="w-4 h-4" />
                                <span>Masuk / Daftar</span>
                            </Link>
                        )}

                        {/* Tombol Hamburger (Mobile) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Dropdown Overlay Mobile */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xl px-4 pt-3 pb-5 space-y-2.5 z-50">
                        {user ? (
                            <>
                                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{user.nama}</p>
                                            <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setIsEditProfileOpen(true); setIsMobileMenuOpen(false); }}
                                        className="text-[11px] font-semibold text-indigo-600 underline"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Tombol Riwayat Pesanan di Mobile (Untuk Semua User) */}
                                <button
                                    onClick={() => { setIsOrderHistoryOpen(true); setIsMobileMenuOpen(false); }}
                                    className="w-full text-left text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl flex items-center gap-2"
                                >
                                    <ClipboardList className="w-4 h-4 text-slate-500" />
                                    <span>Riwayat Pesanan</span>
                                </button>

                                {user.role === 'admin' && (
                                    <>
                                        <button
                                            onClick={() => { setIsAdminProductOpen(true); setIsMobileMenuOpen(false); }}
                                            className="w-full text-left text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl flex items-center gap-2"
                                        >
                                            <Package className="w-4 h-4" />
                                            <span>Kelola Produk</span>
                                        </button>

                                        <button
                                            onClick={() => { setIsAdminOrderOpen(true); setIsMobileMenuOpen(false); }}
                                            className="w-full text-left text-xs font-semibold text-purple-700 bg-purple-50 p-2.5 rounded-xl flex items-center gap-2"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Kelola Pesanan (Admin)</span>
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                    className="w-full text-left text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl flex items-center gap-2 mt-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Keluar Akun</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full bg-indigo-600 text-white font-semibold text-xs p-3 rounded-xl flex items-center justify-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                <span>Masuk / Daftar</span>
                            </Link>
                        )}
                    </div>
                )}
            </header>

            {/* Modal & Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <OrderHistory isOpen={isOrderHistoryOpen} onClose={() => setIsOrderHistoryOpen(false)} />
            <AdminOrderModal isOpen={isAdminOrderOpen} onClose={() => setIsAdminOrderOpen(false)} />
            <AdminProductModal
                isOpen={isAdminProductOpen}
                onClose={() => setIsAdminProductOpen(false)}
                onProductUpdated={() => window.location.reload()}
            />
            <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
        </>
    );
}
