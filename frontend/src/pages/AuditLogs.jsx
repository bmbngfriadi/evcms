import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const response = await axios.get('/evcms/api/audit-logs');
            setLogs(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Audit Logs</h1>
                    <p className="page-desc">Rekam jejak aktivitas sistem EVCMS</p>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Waktu</th>
                            <th>Pengguna</th>
                            <th>Modul</th>
                            <th>Aksi</th>
                            <th>Record ID</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-[var(--primary-500)]/[0.05] transition-colors relative">
                                <td className="text-sm" data-label="Waktu">{formatDate(log.timestamp)}</td>
                                <td className="font-semibold" data-label="Pengguna">{log.user ? log.user.name : 'System'}</td>
                                <td data-label="Modul">
                                    <span className="badge badge-primary">{log.module}</span>
                                </td>
                                <td data-label="Aksi">{log.action}</td>
                                <td data-label="Record ID">{log.record_id || '-'}</td>
                                <td className="text-sm text-[var(--text-secondary)]" data-label="IP Address">{log.ip_address || '-'}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr><td colSpan="6" className="text-center py-8 text-[var(--text-secondary)]">Tidak ada data audit log</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;
