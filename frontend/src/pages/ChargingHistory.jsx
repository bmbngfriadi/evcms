import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const ChargingHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({});

    const fetchHistory = async () => {
        try {
            const response = await axios.get('/evcms/api/charging');
            setHistory(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const toLocalISOString = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const offsetMs = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offsetMs).toISOString();
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setFormData({
            tanggal: item.tanggal ? toLocalISOString(item.tanggal).split('T')[0] : '',
            waktu_mulai: item.waktu_mulai ? toLocalISOString(item.waktu_mulai).slice(0, 16) : '',
            waktu_selesai: item.waktu_selesai ? toLocalISOString(item.waktu_selesai).slice(0, 16) : '',
            soc_before: item.soc_before || '',
            soc_after: item.soc_after !== null ? item.soc_after : '',
            odometer: item.odometer || '',
            dashboard_consumption: item.dashboard_consumption || '',
            status: item.status
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                tanggal: new Date(formData.tanggal).toISOString(),
                waktu_mulai: new Date(formData.waktu_mulai).toISOString(),
                waktu_selesai: formData.waktu_selesai ? new Date(formData.waktu_selesai).toISOString() : null,
                soc_before: parseFloat(formData.soc_before),
                soc_after: formData.soc_after !== '' ? parseFloat(formData.soc_after) : null,
                odometer: parseInt(formData.odometer),
                dashboard_consumption: parseFloat(formData.dashboard_consumption)
            };
            await axios.put(`/evcms/api/charging/${selectedItem.id}`, payload);
            setIsEditModalOpen(false);
            fetchHistory();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to update');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await axios.delete(`/evcms/api/charging/${selectedItem.id}`);
            setIsDeleteModalOpen(false);
            fetchHistory();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to delete');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Charging History</h1>
                    <p className="page-desc">Daftar aktivitas charging kendaraan</p>
                </div>
                {hasPermission('charging.create') && (
                    <Link to="/charging/create" className="btn btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">+ Mulai Charging</Link>
                )}
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Kode Kendaraan</th>
                            <th>Nomor Polisi</th>
                            <th>Daya Baterai Bertambah</th>
                            <th>Odometer</th>
                            <th>Jarak Tempuh</th>
                            <th>Operator</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(item => (
                            <tr key={item.id} onClick={() => navigate(`/charging/${item.id}`)} className="cursor-pointer hover:bg-[var(--primary-500)]/[0.05] transition-colors relative">
                                <td className="whitespace-nowrap" data-label="Tanggal">{format(new Date(item.tanggal), 'dd MMM yyyy')}</td>
                                <td className="whitespace-nowrap font-semibold" data-label="Kode Kendaraan">{item.vehicle.kode}</td>
                                <td className="whitespace-nowrap font-semibold" data-label="Nomor Polisi">{item.vehicle.nomor_polisi}</td>
                                <td data-label="Daya Baterai Bertambah">{item.soc_added !== null ? `${item.soc_added}%` : '-'}</td>
                                <td data-label="Odometer">{item.odometer} km</td>
                                <td data-label="Jarak Tempuh">{item.distance !== null ? `${item.distance} km` : '-'}</td>
                                <td className="whitespace-nowrap" data-label="Operator">{item.operator_name || '-'}</td>
                                <td data-label="Status">
                                    <span className={`badge badge-${item.status === 'COMPLETED' ? 'success' : item.status === 'CANCELLED' ? 'danger' : item.status === 'CHARGING' ? 'info' : 'warning'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td data-label="Aksi">
                                    <div className="flex gap-2 flex-nowrap lg:justify-start justify-end mt-2 lg:mt-0">
                                        {hasPermission('charging.view') && (
                                            <Link to={`/charging/${item.id}`} onClick={e => e.stopPropagation()} className="btn btn-secondary whitespace-nowrap btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Detail</Link>
                                        )}
                                        {hasPermission('charging.edit') && (
                                            <button onClick={(e) => { e.stopPropagation(); openEditModal(item); }} className="btn btn-secondary whitespace-nowrap btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
                                        )}
                                        {hasPermission('charging.delete') && (
                                            <button onClick={(e) => { e.stopPropagation(); openDeleteModal(item); }} className="btn btn-danger whitespace-nowrap btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Delete</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Charging" maxWidth="max-w-3xl">
                <form onSubmit={handleEdit}>
                    <div className="form-grid-2">
                        <div className="form-group md:col-span-2">
                            <label>Status</label>
                            <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="DRAFT">DRAFT</option>
                                <option value="CHARGING">CHARGING</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tanggal</label>
                            <input type="date" required className="form-control" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Waktu Mulai</label>
                            <input type="datetime-local" required className="form-control" value={formData.waktu_mulai} onChange={e => setFormData({...formData, waktu_mulai: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Waktu Selesai</label>
                            <input type="datetime-local" className="form-control" value={formData.waktu_selesai} onChange={e => setFormData({...formData, waktu_selesai: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Odometer</label>
                            <input type="number" required className="form-control" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>SOC Sebelum (%)</label>
                            <input type="number" step="0.1" required className="form-control" value={formData.soc_before} onChange={e => setFormData({...formData, soc_before: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>SOC Setelah (%)</label>
                            <input type="number" step="0.1" className="form-control" value={formData.soc_after} onChange={e => setFormData({...formData, soc_after: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Dashboard Consumption (kWh/100km)</label>
                            <input type="number" step="0.1" required className="form-control" value={formData.dashboard_consumption} onChange={e => setFormData({...formData, dashboard_consumption: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--border-color)]">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">Batal</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Sesi Charging"
                message={`Anda akan menghapus sesi charging ini. Data yang dihapus tidak dapat dikembalikan.`}
                confirmText="Ya, Hapus!"
                type="delete"
                loading={submitting}
            />
        </div>
    );
};

export default ChargingHistory;
