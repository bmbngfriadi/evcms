import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, AlertCircle, Moon, Sun, User, Key, Eye, EyeOff } from 'lucide-react';

const ThemeToggle = () => {
    const [isDark, setIsDark] = React.useState(false);

    React.useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(prev => {
            const next = !prev;
            if (next) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            return next;
        });
    };

    return (
        <button onClick={toggleTheme} className="fixed top-6 right-6 z-50 p-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors" title="Toggle Theme">
            {isDark ? <Sun size={24} className="text-amber-400" /> : <Moon size={24} className="text-white" />}
        </button>
    );
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                navigate('/');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-split-container relative">
            <ThemeToggle />
            
            {/* Brand Panel with Alive Aesthetic */}
            <div className="login-left-panel">
                <div className="relative z-10 flex flex-col justify-center items-center text-center lg:items-start lg:text-left h-full p-4 pt-12 lg:p-16 text-white pb-16 lg:pb-16 mt-2 lg:mt-0">
                    <div className="w-14 h-14 lg:w-20 lg:h-20 bg-white rounded-2xl p-2 shadow-xl flex items-center justify-center mb-4 lg:mb-8 mx-auto lg:mx-0">
                        <img src="https://i.ibb.co.com/prMYS06h/LOGO-2025-03.png" alt="Cemindo Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl lg:text-6xl font-extrabold tracking-tight mb-2 lg:mb-4 drop-shadow-lg">
                        EVCMS
                    </h1>
                    <p className="text-sm lg:text-2xl font-medium opacity-90 drop-shadow-md">
                        Electric Vehicle Charging Management System
                    </p>
                    <p className="text-xs lg:text-xl font-medium opacity-80 drop-shadow-md mt-1">
                        Plant Batam
                    </p>
                    <div className="mt-4 lg:mt-8 flex gap-2 lg:gap-3 flex-wrap justify-center lg:justify-start">
                        <span className="badge bg-white/20 text-white backdrop-blur-md border border-white/30 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm">Monitor</span>
                        <span className="badge bg-white/20 text-white backdrop-blur-md border border-white/30 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm">Energy</span>
                        <span className="badge bg-white/20 text-white backdrop-blur-md border border-white/30 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm">Efficiency</span>
                    </div>
                </div>
            </div>

            {/* Form Panel */}
            <div className="login-right-panel relative">
                <div className="login-card animate-fade-up">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Selamat Datang</h2>
                        <p className="text-[var(--text-secondary)] font-medium">Masuk untuk mengelola armada EV Anda.</p>
                    </div>

                    <Modal isOpen={!!error} onClose={() => setError('')} title="Login Gagal">
                        <div className="flex flex-col items-center justify-center text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-[var(--text-primary)] font-medium text-lg mb-6">{error}</p>
                            <button onClick={() => setError('')} className="btn btn-primary w-full shadow-lg">Tutup</button>
                        </div>
                    </Modal>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 lg:gap-6">
                        <div className="form-group mb-0">
                            <label className="text-sm mb-2 text-[var(--text-primary)] block">Username / Email</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    className="form-control pl-11 py-3.5 lg:py-4 text-sm lg:text-base"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                    placeholder="Enter your username or email"
                                />
                            </div>
                        </div>
                        <div className="form-group mb-0">
                            <label className="text-sm mb-2 text-[var(--text-primary)] block">Password</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-control pl-11 pr-11 py-3.5 lg:py-4 text-sm lg:text-base"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    placeholder="••••••••"
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
                        <div className="flex justify-end mt-1 lg:mt-2">
                            <Link to="/forgot-password" className="text-sm font-semibold text-[var(--primary-500)] hover:text-[var(--primary-600)] transition-colors">Lupa Password?</Link>
                        </div>
                        <button type="submit" className="btn btn-primary w-full mt-2 lg:mt-4 h-12 lg:h-14 text-base lg:text-lg rounded-xl font-bold" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-4 lg:mt-8 text-center text-[10px] lg:text-sm font-medium text-[var(--text-secondary)] opacity-70 uppercase tracking-wide">
                        &copy; {new Date().getFullYear()} EVCMS Plant Batam
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
