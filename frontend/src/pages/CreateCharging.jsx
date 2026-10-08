import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal';
import { AlertCircle } from 'lucide-react';
const CreateCharging = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        vehicleId: '',
        tanggal: new Date().toISOString().split('T')[0],
        waktu_mulai: new Date().toISOString().slice(0, 16),
        soc_before: '',
        odometer: '',
        dashboard_consumption: ''
    });

    const [evidence, setEvidence] = useState({
        SOC_BEFORE: null
    });

    useEffect(() => {
        const fetchVehicles = async () => {
            const res = await axios.get('/evcms/api/vehicles');
            setVehicles(res.data.data.filter(v => v.isActive));
        };
        fetchVehicles();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, type) => {
        setEvidence({ ...evidence, [type]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Create Charging Cycle Draft
            const res = await axios.post('/evcms/api/charging', formData);
            const cycleId = res.data.data.id;

            // 2. Upload Evidences
            const uploadPromises = [];
            
            // Removed SOC_BEFORE upload block as per user request (consolidated into one photo)

            if (evidence.SOC_BEFORE) {
                const fd2 = new FormData();
                fd2.append('type', 'SOC_BEFORE');
                fd2.append('evidence', evidence.SOC_BEFORE);
                uploadPromises.push(axios.post(`/evcms/api/charging/${cycleId}/evidence`, fd2, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }));
            }

            if (uploadPromises.length > 0) {
                await Promise.all(uploadPromises);
            }

            // 3. Start Charging
            await axios.post(`/evcms/api/charging/${cycleId}/start`);

            navigate('/charging');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Mulai Charging Baru</h1>
                    <p className="page-desc">Masukkan data dari dashboard kendaraan</p>
                </div>
            </div>

            <Modal isOpen={!!error} onClose={() => setError('')} title="Pemberitahuan">
                <div className="flex flex-col items-center justify-center text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
                        <AlertCircle size={32} />
                    </div>
                    <p className="text-[var(--text-primary)] font-medium text-lg mb-6">{error}</p>
                    <button onClick={() => setError('')} className="btn btn-primary w-full shadow-lg">Tutup</button>
                </div>
            </Modal>

            <form onSubmit={handleSubmit} className="glass-card">
                <div className="form-group">
                    <label>Pilih Kendaraan</label>
                    <select className="form-control" name="vehicleId" value={formData.vehicleId} onChange={handleChange} required>
                        <option value="">-- Pilih Kendaraan --</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.kode} - {v.nomor_polisi}</option>
                        ))}
                    </select>
                </div>

                <div className="form-grid-2">
                    <div className="form-group">
                        <label>Tanggal</label>
                        <input className="form-control" type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Waktu Mulai</label>
                        <input className="form-control" type="datetime-local" name="waktu_mulai" value={formData.waktu_mulai} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-group">
                    <label>SOC Sebelum Charging (%)</label>
                    <input className="form-control" type="number" step="0.1" name="soc_before" value={formData.soc_before} onChange={handleChange} placeholder="Contoh: 16" required />
                </div>

                <div className="form-group">
                    <label>Odometer Kendaraan (km)</label>
                    <input className="form-control" type="number" name="odometer" value={formData.odometer} onChange={handleChange} placeholder="Contoh: 2579" required />
                </div>

                <div className="form-group">
                    <label>Konsumsi Dashboard (kWh/100km)</label>
                    <input className="form-control" type="number" step="0.1" name="dashboard_consumption" value={formData.dashboard_consumption} onChange={handleChange} placeholder="Contoh: 12.9" required />
                </div>

                <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

                <h3 style={{ marginBottom: '1rem' }}>Evidence Foto</h3>
                
                <div className="form-group">
                    <label className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                        Ambil Foto SOC Sebelum Charging
                    </label>
                    <input className="form-control file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-500)] file:text-white hover:file:bg-[var(--primary-600)]" type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, 'SOC_BEFORE')} required />
                    <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>Anda bisa langsung mengambil foto menggunakan kamera perangkat Anda.</small>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Mulai Charging'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCharging;
