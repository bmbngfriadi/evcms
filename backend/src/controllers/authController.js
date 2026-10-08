const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../prisma');
const { sendPasswordResetEmail } = require('../services/emailService');
const fs = require('fs');
const path = require('path');

exports.login = async (req, res, next) => {
    try {
        const { email: loginIdentifier, password } = req.body;
        
        if (!loginIdentifier || !password) {
            return res.status(400).json({ success: false, message: 'Email/Username and password are required' });
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: loginIdentifier },
                    { username: loginIdentifier }
                ]
            },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: { permission: true }
                        }
                    }
                },
                userPermissions: {
                    include: { permission: true }
                }
            }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'Username/password salah atau akun tidak aktif' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Username/password salah' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role.name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const permissions = new Set();
        user.role.rolePermissions.forEach(rp => permissions.add(rp.permission.name));
        user.userPermissions.forEach(up => permissions.add(up.permission.name));

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                role: user.role.name,
                profile_picture: user.profile_picture,
                permissions: Array.from(permissions)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
            return res.status(404).json({ success: false, message: 'Email tidak ditemukan atau akun tidak aktif' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Save token to DB with 1-hour expiry
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry: new Date(Date.now() + 3600000) // 1 hour
            }
        });

        // Send email
        await sendPasswordResetEmail(user.email, resetToken);

        res.json({ success: true, message: 'Tautan reset password telah dikirim ke email Anda.' });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and newPassword required' });
        }

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Token reset password tidak valid atau sudah kedaluwarsa.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.json({ success: true, message: 'Password berhasil direset. Silakan login dengan password baru.' });
    } catch (error) {
        next(error);
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // from authMiddleware

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Password lama dan baru harus diisi' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Password lama salah' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ success: true, message: 'Password berhasil diperbarui' });
    } catch (error) {
        next(error);
    }
};

exports.updateProfilePicture = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
        }

        // Generate URL for the uploaded file
        // req.file.filename will be the saved file name
        const profilePictureUrl = `/evcms/uploads/${req.file.filename}`;

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { profile_picture: true }
        });

        // Delete old picture if it exists
        if (currentUser && currentUser.profile_picture) {
            const oldFilename = currentUser.profile_picture.split('/').pop();
            const oldPath = path.join(__dirname, '../../uploads', oldFilename);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { profile_picture: profilePictureUrl },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                role: { select: { name: true } },
                profile_picture: true,
            }
        });

        res.json({
            success: true,
            message: 'Foto profil berhasil diperbarui',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                role: user.role.name,
                profile_picture: user.profile_picture
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteProfilePicture = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { profile_picture: true }
        });

        // Delete old picture if it exists
        if (currentUser && currentUser.profile_picture) {
            const oldFilename = currentUser.profile_picture.split('/').pop();
            const oldPath = path.join(__dirname, '../../uploads', oldFilename);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { profile_picture: null },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                role: { select: { name: true } },
                profile_picture: true,
            }
        });

        res.json({
            success: true,
            message: 'Foto profil berhasil dihapus',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                role: user.role.name,
                profile_picture: user.profile_picture
            }
        });
    } catch (error) {
        next(error);
    }
};

