import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const { hasPermission, token } = useAuth();

    const fetchReport = async () => {
        try {
            const response = await axios.get('/evcms/api/reports');
            setReportData(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await axios.get('/evcms/api/reports/export', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Laporan_EVCMS_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed', error);
            alert('Gagal mengekspor laporan');
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade-up max-w-7xl mx-auto">
            <div className="page-header mb-8 flex justify-between items-end">
                <div>
                    <h1 className="page-title">Laporan</h1>
                    <p className="page-desc">Rekapitulasi Konsumsi dan Biaya Charging per Kendaraan</p>
                </div>
                {hasPermission('report.export') && (
                    <button 
                        onClick={handleExport} 
                        disabled={exporting}
                        className="btn btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h2"></path><path d="M8 17h2"></path><path d="M14 13h2"></path><path d="M14 17h2"></path></svg>
                        {exporting ? 'Mengekspor...' : 'Export ke Excel'}
                    </button>
                )}
            </div>

            {reportData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="glass-card flex flex-col justify-center items-center text-center p-6 border border-[var(--primary-500)]/20 shadow-[0_4px_20px_rgba(225,29,72,0.1)]">
                            <span className="text-[var(--text-secondary)] font-bold text-xs md:text-sm uppercase tracking-wider mb-2 truncate max-w-full text-center" title="Total Sesi Charging">Total Sesi Charging</span>
                            <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[var(--primary-500)] truncate max-w-full" title={reportData.summary.totalCycles}>{reportData.summary.totalCycles}</span>
                        </div>
                        <div className="glass-card flex flex-col justify-center items-center text-center p-6 border border-amber-500/20 shadow-[0_4px_20px_rgba(245,158,11,0.1)]">
                            <span className="text-[var(--text-secondary)] font-bold text-xs md:text-sm uppercase tracking-wider mb-2 truncate max-w-full text-center" title="Total Energi (kWh)">Total Energi (kWh)</span>
                            <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-amber-500 truncate max-w-full" title={reportData.summary.totalEnergy.toFixed(2)}>{reportData.summary.totalEnergy.toFixed(2)}</span>
                        </div>
                        <div className="glass-card flex flex-col justify-center items-center text-center p-6 border border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.1)]">
                            <span className="text-[var(--text-secondary)] font-bold text-xs md:text-sm uppercase tracking-wider mb-2 truncate max-w-full text-center" title="Total Biaya Charging">Total Biaya Charging</span>
                            <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-emerald-500 truncate max-w-full" title={formatCurrency(reportData.summary.totalCost)}>{formatCurrency(reportData.summary.totalCost)}</span>
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Kode Kendaraan</th>
                                    <th>Nomor Polisi</th>
                                    <th>Total Jarak (km)</th>
                                    <th>Total Energi (kWh)</th>
                                    <th>Total Biaya (Rp)</th>
                                    <th>Jml Charging</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.byVehicle.map(v => (
                                    <tr key={v.vehicle_kode} className="hover:bg-[var(--primary-500)]/[0.05] transition-colors relative">
                                        <td className="font-bold text-[var(--primary-500)]" data-label="Kode Kendaraan">{v.vehicle_kode}</td>
                                        <td className="font-semibold" data-label="Nomor Polisi">{v.nomor_polisi}</td>
                                        <td data-label="Total Jarak (km)">{v.total_distance} km</td>
                                        <td data-label="Total Energi (kWh)">{v.total_energy.toFixed(2)} kWh</td>
                                        <td className="font-semibold text-emerald-500 dark:text-emerald-400" data-label="Total Biaya (Rp)">{formatCurrency(v.total_cost)}</td>
                                        <td data-label="Jml Charging">{v.charge_count}x</td>
                                    </tr>
                                ))}
                                {reportData.byVehicle.length === 0 && (
                                    <tr><td colSpan="6" className="text-center py-8 text-[var(--text-secondary)]">Tidak ada data laporan</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
