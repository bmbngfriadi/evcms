import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Key, Camera, Loader2, Save, CheckCircle, AlertCircle, Trash2, Eye, X } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    
    const [isPictureLoading, setIsPictureLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Viewer states
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    // Cropper states
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    // Delete state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            return setError('Password baru dan konfirmasi tidak cocok.');
        }

        setIsPasswordLoading(true);
        try {
            const response = await axios.put('/evcms/api/auth/profile/password', {
                currentPassword,
                newPassword
            });
            if (response.data.success) {
                setMessage(response.data.message);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengubah password');
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const onFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                return setError('Hanya file gambar yang diizinkan');
            }
            if (file.size > 5 * 1024 * 1024) {
                return setError('Ukuran file maksimal 5MB');
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || '');
                setIsCropperOpen(true);
            });
            reader.readAsDataURL(file);
        }
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropAndUpload = async () => {
        try {
            setIsPictureLoading(true);
            setIsCropperOpen(false);
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
            
            const formData = new FormData();
            formData.append('profile_picture', croppedBlob, 'profile.jpg');

            setError('');
            setMessage('');
            
            const response = await axios.post('/evcms/api/auth/profile/picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setMessage(response.data.message);
                updateUser(response.data.user);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengunggah foto profil');
        } finally {
            setIsPictureLoading(false);
            setImageSrc(null);
        }
    };

    const handleDeletePicture = async () => {
        setIsDeleteModalOpen(false);
        setIsPictureLoading(true);
        try {
            const response = await axios.delete('/evcms/api/auth/profile/picture');
            if (response.data.success) {
                setMessage(response.data.message);
                updateUser(response.data.user);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghapus foto profil');
        } finally {
            setIsPictureLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--text-primary)]">Profil Saya</h1>
                    <p className="text-[var(--text-secondary)] mt-1 font-medium">Kelola informasi akun dan kata sandi Anda</p>
                </div>
            </div>

            <Modal isOpen={!!error} onClose={() => setError('')} title="Peringatan">
                <div className="flex flex-col items-center justify-center text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
                        <AlertCircle size={32} />
                    </div>
                    <p className="text-[var(--text-primary)] font-medium text-lg mb-6">{error}</p>
                    <button onClick={() => setError('')} className="btn btn-primary w-full shadow-lg">Tutup</button>
                </div>
            </Modal>

            <Modal isOpen={!!message} onClose={() => setMessage('')} title="Berhasil">
                <div className="flex flex-col items-center justify-center text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
                        <CheckCircle size={32} />
                    </div>
                    <p className="text-[var(--text-primary)] font-medium text-lg mb-6">{message}</p>
                    <button onClick={() => setMessage('')} className="btn btn-primary w-full shadow-lg">OK</button>
                </div>
            </Modal>

            <ConfirmModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleDeletePicture}
                title="Hapus Foto Profil" 
                message="Apakah Anda yakin ingin menghapus foto profil? Ikon profil akan kembali ke inisial nama Anda."
                confirmText="Ya, Hapus"
                type="danger"
            />

            {/* Profile Picture Viewer Modal */}
            {isViewerOpen && user?.profile_picture && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity">
                    <button 
                        onClick={() => setIsViewerOpen(false)} 
                        className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <img 
                        src={user.profile_picture} 
                        alt="Profile Full View" 
                        className="max-w-[90%] max-h-[90%] object-contain rounded-xl shadow-2xl" 
                    />
                </div>
            )}

            {/* Image Cropper Modal */}
            {isCropperOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-auto md:max-h-[85vh]">
                        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                            <h3 className="font-bold text-lg">Sesuaikan Foto Profil</h3>
                            <button onClick={() => { setIsCropperOpen(false); setImageSrc(null); }} className="p-1 rounded-full hover:bg-slate-500/10 text-[var(--text-secondary)]">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="relative flex-1 min-h-[300px] w-full bg-slate-900">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <label className="text-sm font-semibold mb-2 block text-[var(--text-secondary)]">Perbesar</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(e.target.value)}
                                    className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-500)]"
                                />
                            </div>
                            <button onClick={handleCropAndUpload} className="btn btn-primary w-full shadow-lg">
                                Simpan Foto
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Picture Card */}
                <div className="card lg:col-span-1 flex flex-col items-center text-center p-8">
                    <div className="relative group mb-6">
                        {isPictureLoading ? (
                            <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-[var(--bg-color)] shadow-xl">
                                <Loader2 className="animate-spin text-[var(--primary-500)]" size={32} />
                            </div>
                        ) : user?.profile_picture ? (
                            <img 
                                src={user.profile_picture} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-full object-cover border-4 border-[var(--bg-color)] shadow-xl cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => setIsViewerOpen(true)}
                                title="Lihat Foto"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-[var(--primary-500)]/10 text-[var(--primary-500)] flex items-center justify-center font-bold text-5xl border-4 border-[var(--bg-color)] shadow-xl">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                        
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={onFileChange}
                        />
                    </div>
                    
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{user?.name}</h3>
                    <p className="text-[var(--text-secondary)] font-medium mb-1">{user?.role}</p>
                    <p className="text-xs text-[var(--text-secondary)] px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-full inline-block mt-2 mb-6">
                        {user?.email}
                    </p>

                    <div className="flex gap-2 w-full mt-auto pt-2 border-t border-[var(--border-color)]">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isPictureLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[var(--primary-500)]/10 text-[var(--primary-500)] hover:bg-[var(--primary-500)] hover:text-white rounded-xl font-bold transition-colors text-sm disabled:opacity-50"
                        >
                            <Camera size={16} /> Ganti
                        </button>
                        
                        {user?.profile_picture && (
                            <>
                                <button 
                                    onClick={() => setIsViewerOpen(true)}
                                    className="p-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                                    title="Lihat Foto"
                                >
                                    <Eye size={20} />
                                </button>
                                <button 
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    disabled={isPictureLoading}
                                    className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors disabled:opacity-50"
                                    title="Hapus Foto"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Password Change Card */}
                <div className="card lg:col-span-2 p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Key size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Ubah Password</h2>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                        <div className="form-group">
                            <label className="text-sm font-semibold mb-2 block text-[var(--text-primary)]">Password Lama</label>
                            <input 
                                type="password" 
                                className="form-control bg-[var(--bg-color)]"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                placeholder="Masukkan password lama Anda"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="form-group">
                                <label className="text-sm font-semibold mb-2 block text-[var(--text-primary)]">Password Baru</label>
                                <input 
                                    type="password" 
                                    className="form-control bg-[var(--bg-color)]"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="Minimal 6 karakter"
                                />
                            </div>
                            <div className="form-group">
                                <label className="text-sm font-semibold mb-2 block text-[var(--text-primary)]">Konfirmasi Password Baru</label>
                                <input 
                                    type="password" 
                                    className="form-control bg-[var(--bg-color)]"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="Ulangi password baru"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 mt-6 border-t border-[var(--border-color)]">
                            <button 
                                type="submit" 
                                className="btn btn-primary px-8 flex items-center gap-2"
                                disabled={isPasswordLoading}
                            >
                                {isPasswordLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>Simpan Password</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
