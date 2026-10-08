const bcrypt = require('bcrypt');
const prisma = require('../prisma');

exports.getAll = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                isActive: true,
                role: true,
                created_at: true
            }
        });
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { username, email, name, password, roleId, isActive } = req.body;
        
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username: username || '' }
                ]
            }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email or Username already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: {
                username,
                email,
                name,
                password: hashedPassword,
                roleId: parseInt(roleId),
                isActive: isActive !== undefined ? isActive : true
            },
            select: { id: true, username: true, email: true, name: true, roleId: true, isActive: true }
        });

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, email, name, password, roleId, isActive } = req.body;

        const dataToUpdate = {};
        if (username) dataToUpdate.username = username;
        if (email) dataToUpdate.email = email;
        if (name) dataToUpdate.name = name;
        if (roleId) dataToUpdate.roleId = parseInt(roleId);
        if (isActive !== undefined) dataToUpdate.isActive = isActive;
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
            select: { id: true, username: true, email: true, name: true, roleId: true, isActive: true }
        });

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};
