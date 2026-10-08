import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post('/evcms/api/auth/forgot-password', { email });
            if (response.data.success) {
                setMessage(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan saat memproses permintaan Anda.');
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
                        Lupa Password
                    </h1>
                    <p className="text-sm lg:text-2xl font-medium opacity-90 drop-shadow-md">
                        Reset akses EVCMS Anda
                    </p>
                </div>
            </div>

            <div className="login-right-panel relative">
                <div className="login-card animate-fade-up">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Lupa Password?</h2>
                        <p className="text-[var(--text-secondary)] font-medium">Masukkan email Anda untuk menerima tautan reset password.</p>
                    </div>

                    <Modal isOpen={!!error} onClose={() => setError('')} title="Gagal">
                        <div className="flex flex-col items-center justify-center text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-[var(--text-primary)] font-medium text-lg mb-6">{error}</p>
                            <button onClick={() => setError('')} className="btn btn-primary w-full shadow-lg">Tutup</button>
                        </div>
                    </Modal>

                    {message ? (
                        <div className="flex flex-col items-center justify-center text-center py-4 animate-fade-up">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
                                <CheckCircle size={32} />
                            </div>
                            <p className="text-[var(--text-primary)] font-medium text-lg mb-6">{message}</p>
                            <Link to="/login" className="btn btn-primary w-full shadow-lg h-12 lg:h-14 flex items-center justify-center rounded-xl font-bold">Kembali ke Login</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 lg:gap-6">
                            <div className="form-group mb-0">
                                <label className="text-sm mb-2 text-[var(--text-primary)] block">Alamat Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input 
                                        type="email" 
                                        className="form-control pl-11 py-3.5 lg:py-4 text-sm lg:text-base"
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                        placeholder="Masukkan alamat email Anda"
                                    />
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary w-full mt-2 lg:mt-4 h-12 lg:h-14 text-base lg:text-lg rounded-xl font-bold" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Mengirim Tautan...</span>
                                    </>
                                ) : (
                                    <span>Kirim Tautan Reset</span>
                                )}
                            </button>
                            
                            <div className="text-center mt-4">
                                <Link to="/login" className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--primary-500)] transition-colors">
                                    Kembali ke Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
