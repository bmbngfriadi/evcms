import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [formData, setFormData] = useState({
        kode: '',
        nomor_polisi: '',
        merk: '',
        model: '',
        tahun: '',
        kapasitas_baterai: '',
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchVehicles = async () => {
        try {
            const response = await axios.get('/evcms/api/vehicles');
            setVehicles(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const openCreateModal = () => {
        setSelectedVehicle(null);
        setFormData({ kode: '', nomor_polisi: '', merk: '', model: '', tahun: '', kapasitas_baterai: '', isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setFormData({
            kode: vehicle.kode,
            nomor_polisi: vehicle.nomor_polisi,
            merk: vehicle.merk,
            model: vehicle.model,
            tahun: vehicle.tahun,
            kapasitas_baterai: vehicle.kapasitas_baterai,
            isActive: vehicle.isActive
        });
        setIsModalOpen(true);
    };

    const openDeleteModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                tahun: parseInt(formData.tahun),
                kapasitas_baterai: parseFloat(formData.kapasitas_baterai)
            };
            
            if (selectedVehicle) {
                await axios.put(`/evcms/api/vehicles/${selectedVehicle.id}`, payload);
            } else {
                await axios.post('/evcms/api/vehicles', payload);
            }
            setIsModalOpen(false);
            fetchVehicles();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to save vehicle');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await axios.delete(`/evcms/api/vehicles/${selectedVehicle.id}`);
            setIsDeleteModalOpen(false);
            fetchVehicles();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to delete vehicle');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Kendaraan</h1>
                    <p className="page-desc">Kelola data kendaraan listrik (EV)</p>
                </div>
                {hasPermission('vehicle.create') && (
                    <button onClick={openCreateModal} className="btn btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                        + Tambah Kendaraan
                    </button>
                )}
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Kode</th>
                            <th>No Polisi</th>
                            <th>Merk</th>
                            <th>Model</th>
                            <th>Tahun</th>
                            <th>Baterai (kWh)</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map(v => (
                            <tr key={v.id} onClick={() => hasPermission('vehicle.edit') && openEditModal(v)} className={`${hasPermission('vehicle.edit') ? 'cursor-pointer hover:bg-[var(--primary-500)]/[0.05] transition-colors relative' : ''}`}>
                                <td className="font-semibold" data-label="Kode">{v.kode}</td>
                                <td data-label="No Polisi">{v.nomor_polisi}</td>
                                <td data-label="Merk">{v.merk}</td>
                                <td data-label="Model">{v.model}</td>
                                <td data-label="Tahun">{v.tahun}</td>
                                <td data-label="Baterai (kWh)">{v.kapasitas_baterai}</td>
                                <td data-label="Status">
                                    <span className={`badge ${v.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {v.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td data-label="Aksi">
                                    <div className="flex gap-2 lg:justify-start justify-end mt-2 lg:mt-0">
                                        {hasPermission('vehicle.edit') && (
                                            <button onClick={(e) => { e.stopPropagation(); openEditModal(v); }} className="btn btn-secondary btn-sm">Edit</button>
                                        )}
                                        {hasPermission('vehicle.delete') && (
                                            <button onClick={(e) => { e.stopPropagation(); openDeleteModal(v); }} className="btn btn-danger btn-sm">Delete</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {vehicles.length === 0 && (
                            <tr><td colSpan="8" className="text-center py-8 text-[var(--text-secondary)]">Tidak ada data kendaraan</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Form Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan'} maxWidth="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Kode Kendaraan (Internal)</label>
                            <input required type="text" className="form-control" value={formData.kode} onChange={e => setFormData({...formData, kode: e.target.value})} placeholder="e.g. EV-001" />
                        </div>
                        <div className="form-group">
                            <label>Nomor Polisi</label>
                            <input required type="text" className="form-control" value={formData.nomor_polisi} onChange={e => setFormData({...formData, nomor_polisi: e.target.value})} placeholder="e.g. B 1234 BYD" />
                        </div>
                        <div className="form-group">
                            <label>Merk</label>
                            <input required type="text" className="form-control" value={formData.merk} onChange={e => setFormData({...formData, merk: e.target.value})} placeholder="e.g. BYD" />
                        </div>
                        <div className="form-group">
                            <label>Model</label>
                            <input required type="text" className="form-control" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="e.g. M6" />
                        </div>
                        <div className="form-group">
                            <label>Tahun Pembuatan</label>
                            <input required type="number" min="2010" className="form-control" value={formData.tahun} onChange={e => setFormData({...formData, tahun: e.target.value})} placeholder="2024" />
                        </div>
                        <div className="form-group">
                            <label>Kapasitas Baterai (kWh)</label>
                            <input required type="number" step="0.1" className="form-control" value={formData.kapasitas_baterai} onChange={e => setFormData({...formData, kapasitas_baterai: e.target.value})} placeholder="71.8" />
                        </div>
                        <div className="form-group md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded accent-[var(--primary-500)]" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                                <span className="font-semibold text-[var(--text-primary)]">Kendaraan Aktif (Siap Digunakan)</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--border-color)]">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Batal</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Menyimpan...' : 'Simpan Kendaraan'}</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Kendaraan"
                message={`Anda akan menghapus kendaraan ${selectedVehicle?.nomor_polisi}. Data yang dihapus tidak dapat dikembalikan.`}
                confirmText="Ya, Hapus!"
                type="delete"
                loading={submitting}
            />
        </div>
    );
};

export default Vehicles;
