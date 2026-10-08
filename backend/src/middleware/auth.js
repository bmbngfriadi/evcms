const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
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
            return res.status(401).json({ success: false, message: 'User not found or inactive' });
        }

        req.user = user;
        
        // Aggregate permissions
        const permissions = new Set();
        user.role.rolePermissions.forEach(rp => permissions.add(rp.permission.name));
        user.userPermissions.forEach(up => permissions.add(up.permission.name));
        
        req.permissions = Array.from(permissions);

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

const permissionMiddleware = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.permissions || !req.permissions.includes(requiredPermission)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

module.exports = { authMiddleware, permissionMiddleware };
