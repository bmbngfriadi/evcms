import React from 'react';
import Modal from './Modal';
import { LogOut, Trash2, XCircle, Info } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Ya, Lanjutkan!', 
    cancelText = 'Batal', 
    type = 'danger', 
    loading = false 
}) => {
    
    const getTypeConfig = () => {
        switch (type) {
            case 'logout':
                return { icon: <LogOut size={40} />, color: 'text-rose-500', bg: 'bg-rose-500/10', btn: 'btn-danger' };
            case 'danger':
            case 'delete':
                return { icon: <Trash2 size={40} />, color: 'text-rose-500', bg: 'bg-rose-500/10', btn: 'btn-danger' };
            case 'cancel':
                return { icon: <XCircle size={40} />, color: 'text-amber-500', bg: 'bg-amber-500/10', btn: 'btn-warning' };
            default:
                return { icon: <Info size={40} />, color: 'text-[var(--primary-500)]', bg: 'bg-[var(--primary-500)]/10', btn: 'btn-primary' };
        }
    };

    const config = getTypeConfig();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="text-center mb-6">
                <div className={`w-20 h-20 ${config.bg} ${config.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    {config.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">Apakah Anda Yakin?</h3>
                <p className="text-[var(--text-secondary)]">
                    {message}
                </p>
            </div>
            <div className="flex justify-center gap-3">
                <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary">
                    {cancelText}
                </button>
                <button type="button" onClick={onConfirm} disabled={loading} className={`btn ${config.btn}`}>
                    {loading ? 'Memproses...' : confirmText}
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
