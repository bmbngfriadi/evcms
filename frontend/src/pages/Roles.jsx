import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Track selected permissions per role
    const [rolePermissionsState, setRolePermissionsState] = useState({});

    const { hasPermission } = useAuth();

    const fetchRolesAndPermissions = async () => {
        try {
            const response = await axios.get('/evcms/api/roles');
            const fetchedRoles = response.data.data.roles;
            const fetchedPermissions = response.data.data.permissions;
            
            setRoles(fetchedRoles);
            setAllPermissions(fetchedPermissions);
            
            // Initialize state for checkboxes
            const initialState = {};
            fetchedRoles.forEach(r => {
                initialState[r.id] = r.rolePermissions.map(rp => rp.permissionId);
            });
            setRolePermissionsState(initialState);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRolesAndPermissions();
    }, []);

    const togglePermission = (roleId, permissionId) => {
        setRolePermissionsState(prev => {
            const current = prev[roleId] || [];
            if (current.includes(permissionId)) {
                return { ...prev, [roleId]: current.filter(id => id !== permissionId) };
            } else {
                return { ...prev, [roleId]: [...current, permissionId] };
            }
        });
    };

    const handleSavePermissions = async (roleId) => {
        setSubmitting(true);
        try {
            const permissionIds = rolePermissionsState[roleId];
            await axios.post(`/evcms/api/roles/${roleId}/permissions`, { permissionIds });
            alert('Permissions updated successfully!');
            fetchRolesAndPermissions();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to update permissions');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade-up max-w-7xl mx-auto">
            <div className="page-header mb-8">
                <div>
                    <h1 className="page-title">User & Permission</h1>
                    <p className="page-desc">Administrator dapat mengatur permission menggunakan checklist.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {roles.map(role => (
                    <div key={role.id} className="glass-card flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-color)] pb-4">
                            <div>
                                <h2 className="text-2xl font-extrabold text-[var(--primary-500)]">{role.name}</h2>
                                {role.description && <p className="text-sm text-[var(--text-secondary)] mt-1">{role.description}</p>}
                            </div>
                            <button 
                                onClick={() => handleSavePermissions(role.id)} 
                                disabled={submitting || !hasPermission('user.manage_permission')}
                                className="btn btn-primary shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                Simpan Perubahan
                            </button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 p-2 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]">
                            {allPermissions.map(permission => {
                                const isChecked = (rolePermissionsState[role.id] || []).includes(permission.id);
                                return (
                                    <label key={permission.id} className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-slate-500/5 rounded-lg transition-colors">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                            <input 
                                                type="checkbox" 
                                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 checked:bg-[var(--primary-500)] checked:border-[var(--primary-500)] transition-all cursor-pointer"
                                                checked={isChecked}
                                                onChange={() => togglePermission(role.id, permission.id)}
                                                disabled={!hasPermission('user.manage_permission')}
                                            />
                                            <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors">
                                                {permission.name}
                                            </span>
                                            {permission.description && (
                                                <span className="text-xs text-[var(--text-secondary)]">
                                                    {permission.description}
                                                </span>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Roles;
