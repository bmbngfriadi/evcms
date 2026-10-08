import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        roleId: 2, // Default to User
        isActive: true,
        password: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const roles = [
        { id: 1, name: 'Administrator' },
        { id: 2, name: 'User' },
        { id: 3, name: 'HRGA Leader' },
        { id: 4, name: 'HRGA Section Head' }
    ];

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/evcms/api/users');
            setUsers(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openCreateModal = () => {
        setSelectedUser(null);
        setFormData({ name: '', username: '', email: '', roleId: 2, isActive: true, password: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            username: user.username || '',
            email: user.email,
            roleId: user.role?.id || 2,
            isActive: user.isActive,
            password: '' // empty password so it won't be changed unless user types something
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                roleId: parseInt(formData.roleId),
                isActive: formData.isActive
            };
            if (formData.password) {
                payload.password = formData.password;
            }
            
            if (selectedUser) {
                await axios.put(`/evcms/api/users/${selectedUser.id}`, payload);
            } else {
                if (!formData.password) {
                    alert('Password is required for new user');
                    setSubmitting(false);
                    return;
                }
                await axios.post('/evcms/api/users', payload);
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to save user');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manage Users</h1>
                    <p className="page-desc">Kelola hak akses pengguna sistem</p>
                </div>
                {hasPermission('user.create') && (
                    <button onClick={openCreateModal} className="btn btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                        + Tambah User
                    </button>
                )}
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.map(u => (
                            <tr key={u.id} onClick={() => hasPermission('user.edit') && openEditModal(u)} className={`${hasPermission('user.edit') ? 'cursor-pointer hover:bg-[var(--primary-500)]/[0.05] transition-colors relative' : ''}`}>
                                <td className="font-semibold" data-label="Nama">{u.name}</td>
                                <td data-label="Username">{u.username}</td>
                                <td data-label="Email">{u.email}</td>
                                <td data-label="Role">
                                    <span className={`badge ${u.role?.name === 'Administrator' ? 'badge-danger' : 'badge-info'}`}>
                                        {u.role?.name?.toUpperCase()}
                                    </span>
                                </td>
                                <td data-label="Status">
                                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {u.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td data-label="Aksi">
                                    <div className="flex gap-2 lg:justify-start justify-end mt-2 lg:mt-0">
                                        {hasPermission('user.edit') && (
                                            <button onClick={(e) => { e.stopPropagation(); openEditModal(u); }} className="btn btn-secondary btn-sm">Edit</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Form Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedUser ? 'Edit User' : 'Tambah User'}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nama Lengkap</label>
                        <input required type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nama lengkap" />
                    </div>
                    <div className="form-group">
                        <label>Username</label>
                        <input required type="text" className="form-control" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="username_unik" />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input required type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@company.com" />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select className="form-control" value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})}>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Password {selectedUser && '(Kosongkan jika tidak ingin mengubah)'}</label>
                        <input type="password" required={!selectedUser} className="form-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="***" />
                    </div>
                    <div className="form-group mt-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 rounded accent-[var(--primary-500)]" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                            <span className="font-semibold text-[var(--text-primary)]">User Aktif</span>
                        </label>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--border-color)]">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Batal</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Menyimpan...' : 'Simpan User'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users;
