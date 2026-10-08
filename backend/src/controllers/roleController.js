const prisma = require('../prisma');

exports.getAll = async (req, res, next) => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            },
            orderBy: { id: 'asc' }
        });
        
        const permissions = await prisma.permission.findMany({
            orderBy: { id: 'asc' }
        });

        res.json({ success: true, data: { roles, permissions } });
    } catch (error) {
        next(error);
    }
};

exports.updatePermissions = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { permissionIds } = req.body;
        
        // Prevent removing all permissions from Administrator (ID 1)
        if (parseInt(id) === 1 && (!permissionIds || permissionIds.length === 0)) {
            return res.status(400).json({ success: false, message: 'Administrator role cannot have empty permissions' });
        }

        // Delete existing
        await prisma.rolePermission.deleteMany({
            where: { roleId: parseInt(id) }
        });

        // Insert new
        if (permissionIds && permissionIds.length > 0) {
            const data = permissionIds.map(pId => ({
                roleId: parseInt(id),
                permissionId: parseInt(pId)
            }));
            await prisma.rolePermission.createMany({ data });
        }

        res.json({ success: true, message: 'Permissions updated successfully' });
    } catch (error) {
        next(error);
    }
};
