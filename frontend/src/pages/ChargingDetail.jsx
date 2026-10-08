import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

const ChargingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    
    // For finishing charging
    const [waktuSelesai, setWaktuSelesai] = useState(new Date().toISOString().slice(0, 16));
    const [socAfter, setSocAfter] = useState('');
    const [evidenceSocAfter, setEvidenceSocAfter] = useState(null);
    const [isFinishing, setIsFinishing] = useState(false);
    
    // Modal states
    const [selectedImage, setSelectedImage] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    // Handle ESC key for modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedImage(null);
        };
        if (selectedImage) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`/evcms/api/charging/${id}`);
            setData(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = (e) => {
        e.preventDefault();
        setIsFinishModalOpen(true);
    };

    const confirmFinish = async () => {
        setIsFinishModalOpen(false);
        setIsFinishing(true);
        try {
            if (evidenceSocAfter) {
                const fd = new FormData();
                fd.append('type', 'SOC_AFTER');
                fd.append('evidence', evidenceSocAfter);
                await axios.post(`/evcms/api/charging/${id}/evidence`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            await axios.post(`/evcms/api/charging/${id}/finish`, {
                waktu_selesai: waktuSelesai,
                soc_after: socAfter
            });
            
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyelesaikan charging');
        } finally {
            setIsFinishing(false);
        }
    };

    const openCancelModal = () => {
        setIsCancelModalOpen(true);
    };

    const confirmCancel = async () => {
        setIsCanceling(true);
        try {
            await axios.post(`/evcms/api/charging/${id}/cancel`);
            setIsCancelModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Gagal membatalkan');
        } finally {
            setIsCanceling(false);
        }
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>Data not found</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header mb-8">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <button onClick={() => navigate('/charging')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-full hover:bg-[var(--border-color)]" title="Kembali ke Riwayat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        </button>
                        <h1 className="page-title !mb-0">Detail Charging #{data.id}</h1>
                    </div>
                    <div className="ml-14">
                        <span className={`badge badge-${data.status === 'COMPLETED' ? 'success' : data.status === 'CANCELLED' ? 'danger' : data.status === 'CHARGING' ? 'info' : 'warning'}`}>
                            {data.status}
                        </span>
                    </div>
                </div>
                {data.status === 'CHARGING' && hasPermission('charging.cancel') && (
                    <button onClick={openCancelModal} className="btn btn-danger shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">Batalkan</button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Informasi Charging</h2>
                    <p><strong>Kendaraan:</strong> {data.vehicle.kode} - {data.vehicle.nomor_polisi}</p>
                    <p><strong>Tanggal:</strong> {format(new Date(data.tanggal), 'dd MMMM yyyy')}</p>
                    <p><strong>Waktu:</strong> {format(new Date(data.waktu_mulai), 'HH:mm')} - {data.waktu_selesai ? format(new Date(data.waktu_selesai), 'HH:mm') : '...'}</p>
                    <p><strong>Operator:</strong> {data.operator_name || '-'}</p>
                </div>

                <div className="glass-card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Kondisi Kendaraan</h2>
                    <p><strong>SOC Before:</strong> {data.soc_before}%</p>
                    <p><strong>SOC After:</strong> {data.soc_after !== null ? `${data.soc_after}%` : '-'}</p>
                    <p><strong>SOC Added:</strong> {data.soc_added !== null ? `${data.soc_added}%` : '-'}</p>
                    <p><strong>Odometer:</strong> {data.odometer} km</p>
                    <p><strong>Distance:</strong> {data.distance !== null ? `${data.distance} km` : '-'}</p>
                </div>

                <div className="glass-card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Konsumsi</h2>
                    <p><strong>Dashboard Consumption:</strong> {data.dashboard_consumption} kWh/100km</p>
                    <p><strong>Estimated Energy:</strong> {data.estimated_vehicle_energy !== null ? `${data.estimated_vehicle_energy} kWh` : '-'}</p>
                </div>

                <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '0.5rem', color: 'var(--success-color)' }}>Biaya</h2>
                    <p><strong>Battery Capacity:</strong> {data.battery_capacity_snapshot || data.vehicle.kapasitas_baterai} kWh</p>
                    <p><strong>Electricity Tariff:</strong> {data.electricity_tariff_snapshot !== null ? `${formatCurrency(data.electricity_tariff_snapshot)}/kWh` : '-'}</p>
                    <p><strong>Estimated Charging Cost:</strong> {formatCurrency(data.estimated_charging_cost)}</p>
                    <p><strong>Estimated Energy Cost:</strong> {formatCurrency(data.estimated_energy_cost)}</p>
                    <p style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(16, 185, 129, 0.2)', fontWeight: 600, fontSize: '1.1rem' }}>
                        Cost/km: {formatCurrency(data.cost_per_km)}
                    </p>
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Evidence Foto</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {data.evidences.map(e => (
                        <div key={e.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textAlign: 'center' }}>
                                {e.type === 'SOC_AFTER' ? 'Foto dashboard setelah charging' : 'Foto dashboard sebelum charging'}
                            </div>
                            <img 
                                src={`${e.filepath}?t=${new Date().getTime()}`} 
                                alt={e.type} 
                                style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }} 
                                onClick={() => setSelectedImage(e.filepath)}
                            />
                        </div>
                    ))}
                    {data.evidences.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Tidak ada foto evidence.</p>}
                </div>
            </div>

            {data.status === 'CHARGING' && hasPermission('charging.finish') && (
                <div className="glass-card" style={{ border: '1px solid var(--primary-color)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Selesaikan Charging</h2>
                    <form onSubmit={handleFinish}>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Waktu Selesai</label>
                                <input className="form-control" type="datetime-local" value={waktuSelesai} onChange={e => setWaktuSelesai(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>SOC Setelah Charging (%)</label>
                                <input className="form-control" type="number" step="0.1" value={socAfter} onChange={e => setSocAfter(e.target.value)} required placeholder="Contoh: 80" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                                Ambil Foto Dashboard Setelah Charging (SOC & ODO)
                            </label>
                            <input className="form-control file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-500)] file:text-white hover:file:bg-[var(--primary-600)]" type="file" accept="image/*" capture="environment" onChange={e => setEvidenceSocAfter(e.target.files[0])} required />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>Anda bisa langsung mengambil foto menggunakan kamera perangkat Anda.</small>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isFinishing}>
                            {isFinishing ? 'Menyimpan...' : 'Selesaikan Charging'}
                        </button>
                    </form>
                </div>
            )}

            {/* Image Preview Modal */}
            {selectedImage && (
                <div 
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 9999, padding: '2rem'
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <img 
                        src={`${selectedImage}?t=${new Date().getTime()}`} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
                    />
                    <button 
                        onClick={() => setSelectedImage(null)}
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', zIndex: 10000 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            <ConfirmModal 
                isOpen={isCancelModalOpen} 
                onClose={() => setIsCancelModalOpen(false)} 
                onConfirm={confirmCancel}
                title="Batalkan Sesi Charging" 
                message="Apakah Anda yakin ingin membatalkan sesi charging ini? Aksi ini tidak dapat dibatalkan."
                confirmText="Ya, Batalkan!"
                type="cancel"
                loading={isCanceling}
            />

            {/* Finish Confirmation Modal */}
            <ConfirmModal 
                isOpen={isFinishModalOpen} 
                onClose={() => setIsFinishModalOpen(false)} 
                onConfirm={confirmFinish}
                title="Selesaikan Sesi Charging" 
                message="Apakah Anda yakin data SOC dan waktu selesai yang diinputkan sudah benar? Setelah diselesaikan, data tidak dapat diubah lagi."
                confirmText="Ya, Selesaikan!"
                type="success"
                loading={isFinishing}
            />
        </div>
    );
};

export default ChargingDetail;
