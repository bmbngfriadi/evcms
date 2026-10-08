import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { Activity, Battery, Car, Zap, DollarSign, TrendingUp, BarChart2 } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await axios.get('/evcms/api/dashboard');
                setData(response.data.data);
            } catch (error) {
                console.error('Failed to fetch dashboard', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-500)]"></div>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass }) => (
        <div className={`glass-card overflow-hidden relative group`}>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${gradientClass}`}>
                    <Icon size={24} />
                </div>
            </div>
            <h3 className="text-[var(--text-secondary)] text-xs md:text-sm font-semibold mb-1 relative z-10 truncate" title={title}>{title}</h3>
            <div className={`text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight ${colorClass} relative z-10 truncate`} title={value}>{value}</div>
        </div>
    );

    return (
        <div className="animate-fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Executive Dashboard</h1>
                    <p className="page-desc">Overview of Electric Vehicle Charging Metrics & Performance</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    title="Total Charging Cycle" 
                    value={data?.totalChargingCycle || 0} 
                    icon={Activity}
                    colorClass="text-[var(--primary-500)]"
                    gradientClass="bg-gradient-to-br from-rose-500 to-rose-700"
                />
                <StatCard 
                    title="Total Kendaraan" 
                    value={data?.totalVehicles || 0} 
                    icon={Car}
                    colorClass="text-blue-500 dark:text-blue-400"
                    gradientClass="bg-gradient-to-br from-blue-500 to-indigo-600"
                />
                <StatCard 
                    title="Total Jarak (km)" 
                    value={(data?.totalDistance || 0).toLocaleString('id-ID')} 
                    icon={TrendingUp}
                    colorClass="text-emerald-500 dark:text-emerald-400"
                    gradientClass="bg-gradient-to-br from-emerald-400 to-emerald-600"
                />
                <StatCard 
                    title="Rata-rata Konsumsi" 
                    value={`${data?.averageConsumption || 0} kWh`} 
                    icon={Battery}
                    colorClass="text-amber-500 dark:text-amber-400"
                    gradientClass="bg-gradient-to-br from-amber-400 to-orange-500"
                />
                <StatCard 
                    title="Total Estimasi Energi" 
                    value={`${(data?.totalEstimatedEnergy || 0).toLocaleString('id-ID')} kWh`} 
                    icon={Zap}
                    colorClass="text-amber-500 dark:text-amber-400"
                    gradientClass="bg-gradient-to-br from-amber-400 to-orange-500"
                />
                <StatCard 
                    title="Total Biaya Charging" 
                    value={formatCurrency(data?.totalEstimatedChargingCost || 0)} 
                    icon={DollarSign}
                    colorClass="text-rose-500 dark:text-rose-400"
                    gradientClass="bg-gradient-to-br from-rose-400 to-red-600"
                />
                <StatCard 
                    title="Rata-rata Cost/km" 
                    value={formatCurrency(data?.averageCostPerKm || 0)} 
                    icon={DollarSign}
                    colorClass="text-emerald-500 dark:text-emerald-400"
                    gradientClass="bg-gradient-to-br from-emerald-400 to-green-600"
                />
                <StatCard 
                    title="Rata-rata SOC Charging" 
                    value={`${data?.averageSocAdded || 0}%`} 
                    icon={Battery}
                    colorClass="text-[var(--primary-500)]"
                    gradientClass="bg-gradient-to-br from-rose-500 to-rose-700"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="glass-card">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-[var(--primary-500)]" />
                        <h3 className="text-lg font-bold">Charging per Bulan</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.monthlyChartData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px' }} />
                                <Bar dataKey="total_charging" name="Total Charging" fill="#b52025" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="flex items-center gap-2 mb-6">
                        <Battery className="text-amber-500" />
                        <h3 className="text-lg font-bold">Konsumsi (kWh/100 km) per Bulan</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.monthlyChartData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="avg_consumption" name="Avg Konsumsi" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="flex items-center gap-2 mb-6">
                        <DollarSign className="text-rose-500" />
                        <h3 className="text-lg font-bold">Estimasi Biaya per Bulan</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.monthlyChartData || []} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${value/1000}k`} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="total_cost" name="Est. Biaya" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="text-emerald-500" />
                        <h3 className="text-lg font-bold">Jarak Kendaraan per Bulan (km)</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.monthlyChartData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px' }} />
                                <Bar dataKey="total_distance" name="Total Jarak (km)" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Floating Action Button (Mobile Only) */}
            <div className="lg:hidden fixed bottom-24 right-4 z-50 shadow-[0_8px_30px_rgba(225,29,72,0.6)] rounded-full animate-bounce">
                <Link to="/charging/create" className="flex items-center gap-2 bg-[var(--primary-500)] text-white px-5 py-3.5 rounded-full font-bold whitespace-nowrap active:scale-95 transition-transform border border-white/20">
                    <Zap size={22} className="fill-white shrink-0 animate-pulse" />
                    <span className="text-sm">Mulai Charging</span>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
