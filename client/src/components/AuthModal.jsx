import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AuthModal({ isOpen, onClose }) {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);

    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Menghapus '/api' di depan karena baseURL sudah memuatnya
        const endpoint = isLogin
            ? '/auth/login'
            : '/auth/register';

        const payload = isLogin
            ? { email, password }
            : { nama, email, password, role };

        try {
            // Menggunakan api.post alih-alih fetch
            const response = await api.post(endpoint, payload);
            const data = response.data;

            if (isLogin) {
                login(data.user, data.token);
                onClose();
            } else {
                setMessage({ type: 'success', text: data.message || 'Pendaftaran berhasil!' });
                setIsLogin(true);
            }
        } catch (err) {
            // Penanganan error khas Axios
            setMessage({
                type: 'error',
                text: err.response?.data?.message || err.message || 'Terjadi kesalahan.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">
                        {isLogin ? 'Masuk ke Akun' : 'Buat Akun Baru'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 font-bold p-1"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {message.text && (
                        <div
                            className={`p-3 rounded-xl text-xs text-center font-medium ${message.type === 'error'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-green-50 text-green-700 border border-green-200'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                required
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                placeholder="Masukkan nama lengkap"
                                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Alamat Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Kata Sandi
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Daftar Sebagai
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label
                                    className={`flex items-center justify-center gap-2 p-2.5 border rounded-xl cursor-pointer text-xs font-semibold transition-all ${role === 'customer'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value="customer"
                                        checked={role === 'customer'}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="hidden"
                                    />
                                    <span>🛒 Pelanggan</span>
                                </label>

                                <label
                                    className={`flex items-center justify-center gap-2 p-2.5 border rounded-xl cursor-pointer text-xs font-semibold transition-all ${role === 'admin'
                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                        checked={role === 'admin'}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="hidden"
                                    />
                                    <span>⚙️ Admin</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-sm mt-2 disabled:bg-indigo-400"
                    >
                        {loading
                            ? 'Memproses...'
                            : isLogin
                                ? 'Masuk'
                                : 'Daftar Sekarang'}
                    </button>
                </form>

                <div className="p-4 bg-gray-50 border-t text-center text-xs text-gray-600">
                    {isLogin ? (
                        <p>
                            Belum punya akun?{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(false);
                                    setMessage({ type: '', text: '' });
                                }}
                                className="text-indigo-600 font-bold hover:underline"
                            >
                                Daftar Sekarang
                            </button>
                        </p>
                    ) : (
                        <p>
                            Sudah punya akun?{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(true);
                                    setMessage({ type: '', text: '' });
                                }}
                                className="text-indigo-600 font-bold hover:underline"
                            >
                                Masuk sekarang
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
