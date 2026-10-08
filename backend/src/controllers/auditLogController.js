const prisma = require('../prisma');

exports.getAll = async (req, res, next) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 100 // limit to last 100 logs for performance
        });
        res.json({ success: true, data: logs });
    } catch (error) {
        next(error);
    }
};
