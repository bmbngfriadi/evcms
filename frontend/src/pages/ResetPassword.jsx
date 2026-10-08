import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Token reset password tidak ditemukan. Silakan minta tautan baru.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            return setError('Password dan Konfirmasi Password tidak cocok.');
        }
        if (password.length < 6) {
            return setError('Password harus memiliki setidaknya 6 karakter.');
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/evcms/api/auth/reset-password', { 
                token, 
                newPassword: password 
            });
            if (response.data.success) {
                setMessage(response.data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mereset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-split-container relative">
            <div className="login-left-panel">
                <div className="relative z-10 flex flex-col justify-center items-center text-center lg:items-start lg:text-left h-full p-4 pt-12 lg:p-16 text-white pb-16 lg:pb-16 mt-2 lg:mt-0">
                    <div className="w-14 h-14 lg:w-20 lg:h-20 bg-white rounded-2xl p-2 shadow-xl flex items-center justify-center mb-4 lg:mb-8 mx-auto lg:mx-0">
                        <img src="https://i.ibb.co.com/prMYS06h/LOGO-2025-03.png" alt="Cemindo Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl lg:text-6xl font-extrabold tracking-tight mb-2 lg:mb-4 drop-shadow-lg">
                        Reset Password
                    </h1>
                    <p className="text-sm lg:text-2xl font-medium opacity-90 drop-shadow-md">
                        Buat password baru untuk akun Anda
                    </p>
                </div>
            </div>

            <div className="login-right-panel relative">
                <div className="login-card animate-fade-up">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Password Baru</h2>
                        <p className="text-[var(--text-secondary)] font-medium">Masukkan password baru untuk akun EVCMS Anda.</p>
                    </div>

                    <Modal isOpen={!!error && !error.includes('tidak ditemukan')} onClose={() => setError('')} title="Gagal">
                        <div className="flex flex-col items-center justify-center text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-[var(--text-primary)] font-medium text-lg mb-6">{error}</p>
                            <button onClick={() => setError('')} className="btn btn-primary w-full shadow-lg">Tutup</button>
                        </div>
                    </Modal>

                    {error && error.includes('tidak ditemukan') ? (
                        <div className="flex flex-col items-center justify-center text-center py-4 animate-fade-up">
                            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-[var(--text-primary)] font-medium text-lg mb-6">{error}</p>
                            <Link to="/forgot-password" className="btn btn-primary w-full shadow-lg h-12 lg:h-14 flex items-center justify-center rounded-xl font-bold">Minta Tautan Baru</Link>
                        </div>
                    ) : message ? (
                        <div className="flex flex-col items-center justify-center text-center py-4 animate-fade-up">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
                                <CheckCircle size={32} />
                            </div>
                            <p className="text-[var(--text-primary)] font-medium text-lg mb-6">{message}</p>
                            <p className="text-[var(--text-secondary)] text-sm">Anda akan dialihkan ke halaman login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 lg:gap-6">
                            <div className="form-group mb-0">
                                <label className="text-sm mb-2 text-[var(--text-primary)] block">Password Baru</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="form-control pl-11 pr-11 py-3.5 lg:py-4 text-sm lg:text-base"
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group mb-0">
                                <label className="text-sm mb-2 text-[var(--text-primary)] block">Konfirmasi Password Baru</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        className="form-control pl-11 pr-11 py-3.5 lg:py-4 text-sm lg:text-base"
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required 
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary w-full mt-2 lg:mt-4 h-12 lg:h-14 text-base lg:text-lg rounded-xl font-bold" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <span>Reset Password</span>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
