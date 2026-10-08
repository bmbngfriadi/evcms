import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, BatteryCharging, Car, Zap, Users, ShieldCheck, FileText, ClipboardList, LogOut, Moon, Sun, MoreHorizontal, X } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
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
        <button onClick={toggleTheme} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-500/10 transition-colors w-full text-left" title="Toggle Theme">
            {isDark ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} className="text-slate-600 dark:text-slate-400" />}
            <span className="font-semibold text-[var(--text-primary)] lg:block hidden">
                {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
        </button>
    );
};

const MobileTopHeader = ({ onLogout }) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        setIsDark(next);
    };

    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 w-full z-50 flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full p-1 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-slate-200 flex items-center justify-center">
                    <img src="https://i.ibb.co.com/prMYS06h/LOGO-2025-03.png" alt="Cemindo Logo" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
                <h1 className="font-medium text-[15px] leading-[1.1] text-[var(--text-primary)] max-w-[180px]">
                    EV Charging Management System
                </h1>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className="p-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors shrink-0">
                    {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600 dark:text-slate-400" />}
                </button>
                <button onClick={onLogout} className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/30 transition-colors shrink-0" title="Keluar">
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
};

const Layout = ({ children }) => {
    const { user, logout, hasPermission } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
        { path: '/charging', label: 'History', icon: BatteryCharging, permission: 'charging.view' },
        { path: '/vehicles', label: 'Kendaraan', icon: Car, permission: 'vehicle.view' },
        { path: '/tariffs', label: 'Tarif', icon: Zap, permission: 'tariff.view' },
        { path: '/reports', label: 'Laporan', icon: ClipboardList, permission: 'report.view' },
        { path: '/users', label: 'Users', icon: Users, permission: 'user.view' },
        { path: '/roles', label: 'Roles', icon: ShieldCheck, permission: 'user.manage_permission' },
        { path: '/audit-logs', label: 'Audit Logs', icon: FileText, permission: 'audit.view' }
    ];

    const authorizedNavItems = navItems.filter(item => hasPermission(item.permission));
    
    // For mobile, display max 4 icons. If > 4, display 3 icons + "More"
    const isMobileMoreNeeded = authorizedNavItems.length > 4;
    const mobileVisibleItems = isMobileMoreNeeded ? authorizedNavItems.slice(0, 3) : authorizedNavItems;
    const mobileMoreItems = isMobileMoreNeeded ? authorizedNavItems.slice(3) : [];

    return (
        <div className="flex bg-[var(--bg-color)] min-h-screen text-[var(--text-primary)]">
            {/* Desktop Sidebar (lg:flex) */}
            <aside className="hidden lg:flex flex-col w-64 xl:w-72 sticky top-6 h-[calc(100vh-3rem)] ml-6 bg-[var(--bg-card)] rounded-[24px] shadow-sm border border-[var(--border-color)] overflow-y-auto">
                <div className="p-8">
                    <h2 className="text-3xl font-extrabold text-[var(--primary-500)] tracking-tight m-0">EVCMS</h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">Monitor • Energy • Efficiency</p>
                </div>

                <nav className="flex-1 px-4 flex flex-col gap-2">
                    {authorizedNavItems.map(item => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-semibold
                                    ${isActive 
                                        ? 'bg-[var(--primary-500)] text-white shadow-[0_4px_12px_rgba(225,29,72,0.25)]' 
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)] hover:translate-x-1'
                                    }`
                                }
                            >
                                <Icon size={22} className={isActive ? 'text-white' : ''} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[var(--border-color)]">
                    <ThemeToggle />
                    
                    <Link to="/profile" className="flex items-center gap-3 mt-4 mb-4 px-2 hover:bg-slate-500/10 rounded-xl py-2 transition-colors">
                        {user?.profile_picture ? (
                            <img src={user.profile_picture} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[var(--primary-500)]/10 text-[var(--primary-500)] flex items-center justify-center font-bold">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="font-bold truncate text-sm">{user?.name}</div>
                            <div className="text-xs text-[var(--text-secondary)] truncate">{user?.role}</div>
                        </div>
                    </Link>

                    <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-slate-500/10 text-rose-500 hover:bg-rose-500/10 font-bold transition-colors">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-full overflow-x-hidden flex flex-col">
                <MobileTopHeader onLogout={handleLogout} />
                <div className="p-4 lg:p-8 pb-28 lg:pb-8 pt-20 lg:pt-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation (lg:hidden) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-color)] z-40 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <nav className="flex justify-around items-center">
                    {mobileVisibleItems.map(item => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setShowMoreMenu(false)}
                                className={`flex flex-col items-center justify-center w-20 h-16 rounded-2xl transition-all duration-300
                                    ${isActive 
                                        ? 'text-[var(--primary-500)] bg-[var(--primary-500)]/10' 
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)]'
                                    }`
                                }
                            >
                                <Icon size={24} className={`mb-1 ${isActive ? 'fill-[var(--primary-500)]/10 text-[var(--primary-500)]' : ''}`} />
                                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                            </NavLink>
                        );
                    })}

                    {isMobileMoreNeeded && (
                        <button
                            onClick={() => setShowMoreMenu(true)}
                            className={`flex flex-col items-center justify-center w-20 h-16 rounded-2xl transition-all duration-300
                                ${showMoreMenu ? 'text-[var(--primary-500)] bg-[var(--primary-500)]/10' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)]'}
                            `}
                        >
                            <MoreHorizontal size={24} className="mb-1" />
                            <span className="text-[10px] font-bold tracking-wide">Menu</span>
                        </button>
                    )}
                </nav>
            </div>

            {/* Mobile "More" Bottom Sheet Modal */}
            {showMoreMenu && isMobileMoreNeeded && (
                <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                        onClick={() => setShowMoreMenu(false)}
                    />
                    
                    {/* Bottom Sheet */}
                    <div className="relative w-full bg-[var(--bg-card)] rounded-t-[32px] p-6 shadow-2xl transform transition-transform animate-slide-up-sheet">
                        <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full mx-auto mb-6" />
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-extrabold">Menu Lainnya</h3>
                            <button onClick={() => setShowMoreMenu(false)} className="p-2 bg-[var(--bg-color)] rounded-full text-[var(--text-secondary)]">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {mobileMoreItems.map(item => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setShowMoreMenu(false)}
                                        className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all
                                            ${isActive ? 'bg-[var(--primary-500)] text-white shadow-[0_4px_12px_rgba(225,29,72,0.25)]' : 'bg-[var(--bg-color)] text-[var(--text-primary)] border border-[var(--border-color)]'}
                                        `}
                                    >
                                        <Icon size={24} />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-color)] rounded-2xl mb-4 border border-[var(--border-color)]">
                            <Link to="/profile" onClick={() => setShowMoreMenu(false)} className="flex items-center gap-3 hover:bg-slate-500/10 rounded-xl p-2 transition-colors w-full">
                        {user?.profile_picture ? (
                            <img src={user.profile_picture} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                        ) : (
                                <div className="w-12 h-12 rounded-full bg-[var(--primary-500)]/10 text-[var(--primary-500)] flex items-center justify-center font-bold text-lg">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </div>
                        )}
                                <div>
                                    <div className="font-bold text-sm">{user?.name}</div>
                                    <div className="text-xs text-[var(--text-secondary)]">{user?.role}</div>
                                </div>
                            </Link>
                        </div>

                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-bold transition-colors text-lg">
                            <LogOut size={22} />
                            Logout
                        </button>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            <ConfirmModal 
                isOpen={isLogoutModalOpen} 
                onClose={() => setIsLogoutModalOpen(false)} 
                onConfirm={confirmLogout}
                title="Konfirmasi Logout" 
                message="Anda akan keluar dari sistem. Sesi Anda saat ini akan diakhiri dan Anda perlu masuk kembali untuk mengakses EVCMS."
                confirmText="Ya, Logout"
                type="logout"
            />
        </div>
    );
};

export default Layout;
