import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const Tariffs = () => {
    const [tariffs, setTariffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTariff, setSelectedTariff] = useState(null);
    const [formData, setFormData] = useState({
        nama: '',
        harga_per_kwh: '',
        tanggal_mulai: new Date().toISOString().split('T')[0],
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchTariffs = async () => {
        try {
            const response = await axios.get('/evcms/api/tariffs');
            setTariffs(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTariffs();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    const openCreateModal = () => {
        setSelectedTariff(null);
        setFormData({ nama: '', harga_per_kwh: '', tanggal_mulai: new Date().toISOString().split('T')[0], isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (tariff) => {
        setSelectedTariff(tariff);
        setFormData({
            nama: tariff.nama || '',
            harga_per_kwh: tariff.harga_per_kwh || '',
            tanggal_mulai: tariff.tanggal_mulai ? new Date(tariff.tanggal_mulai).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            isActive: tariff.isActive
        });
        setIsModalOpen(true);
    };

    const openDeleteModal = (tariff) => {
        setSelectedTariff(tariff);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                nama: formData.nama,
                harga_per_kwh: parseFloat(formData.harga_per_kwh),
                tanggal_mulai: formData.tanggal_mulai,
                isActive: formData.isActive
            };
            
            if (selectedTariff) {
                await axios.put(`/evcms/api/tariffs/${selectedTariff.id}`, payload);
            } else {
                await axios.post('/evcms/api/tariffs', payload);
            }
            setIsModalOpen(false);
            fetchTariffs();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to save tariff');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await axios.delete(`/evcms/api/tariffs/${selectedTariff.id}`);
            setIsDeleteModalOpen(false);
            fetchTariffs();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to delete tariff');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Tarif Listrik</h1>
                    <p className="page-desc">Kelola data lokasi dan tarif dasar listrik per kWh</p>
                </div>
                {hasPermission('tariff.create') && (
                    <button onClick={openCreateModal} className="btn btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                        + Tambah Tarif
                    </button>
                )}
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama Tarif</th>
                            <th>Harga/kWh</th>
                            <th>Tanggal Berlaku</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tariffs.map(t => (
                            <tr key={t.id} onClick={() => hasPermission('tariff.edit') && openEditModal(t)} className={`${hasPermission('tariff.edit') ? 'cursor-pointer hover:bg-[var(--primary-500)]/[0.05] transition-colors relative' : ''}`}>
                                <td className="font-semibold" data-label="Nama Tarif">{t.nama}</td>
                                <td data-label="Harga/kWh">{formatCurrency(t.harga_per_kwh)}</td>
                                <td data-label="Tanggal Berlaku">{t.tanggal_mulai ? new Date(t.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</td>
                                <td data-label="Status">
                                    <span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {t.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td data-label="Aksi">
                                    <div className="flex gap-2 lg:justify-start justify-end mt-2 lg:mt-0">
                                        {hasPermission('tariff.edit') && (
                                            <button onClick={(e) => { e.stopPropagation(); openEditModal(t); }} className="btn btn-secondary btn-sm">Edit</button>
                                        )}
                                        {hasPermission('tariff.delete') && (
                                            <button onClick={(e) => { e.stopPropagation(); openDeleteModal(t); }} className="btn btn-danger btn-sm">Delete</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {tariffs.length === 0 && (
                            <tr><td colSpan="5" className="text-center py-8 text-[var(--text-secondary)]">Tidak ada data tarif</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Form Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedTariff ? 'Edit Tarif' : 'Tambah Tarif'} maxWidth="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="form-group md:col-span-2">
                            <label>Nama Tarif</label>
                            <input required type="text" className="form-control" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} placeholder="e.g. Tarif Rumah" />
                        </div>
                        <div className="form-group">
                            <label>Harga per kWh (Rp)</label>
                            <input required type="number" step="0.01" className="form-control" value={formData.harga_per_kwh} onChange={e => setFormData({...formData, harga_per_kwh: e.target.value})} placeholder="1500" />
                        </div>
                        <div className="form-group">
                            <label>Tanggal Berlaku</label>
                            <input required type="date" className="form-control" value={formData.tanggal_mulai} onChange={e => setFormData({...formData, tanggal_mulai: e.target.value})} />
                        </div>
                        <div className="form-group flex items-center md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer mt-2">
                                <input type="checkbox" className="w-5 h-5 rounded accent-[var(--primary-500)]" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                                <span className="font-semibold text-[var(--text-primary)]">Status Aktif</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--border-color)]">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Batal</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Menyimpan...' : 'Simpan Tarif'}</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Tarif"
                message={`Anda akan menghapus tarif ${selectedTariff?.nama} secara permanen.`}
                confirmText="Ya, Hapus!"
                type="delete"
                loading={submitting}
            />
        </div>
    );
};

export default Tariffs;
