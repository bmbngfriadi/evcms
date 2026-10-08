const prisma = require('../prisma');

const logAudit = async (req, action, recordId, oldValue, newValue) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action,
                module: 'TARIFF',
                record_id: recordId,
                old_value: oldValue || null,
                new_value: newValue || null,
                ip_address: req.ip
            }
        });
    } catch (e) {
        console.error('Audit log failed', e);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const tariffs = await prisma.electricityTariff.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json({ success: true, data: tariffs });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const data = req.body;
        const tariff = await prisma.electricityTariff.create({
            data: {
                nama: data.nama,
                harga_per_kwh: parseFloat(data.harga_per_kwh),
                tanggal_mulai: new Date(data.tanggal_mulai),
                tanggal_selesai: data.tanggal_selesai ? new Date(data.tanggal_selesai) : null,
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });
        
        await logAudit(req, 'CREATE_TARIFF', tariff.id, null, tariff);
        
        res.status(201).json({ success: true, data: tariff });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const oldTariff = await prisma.electricityTariff.findUnique({ where: { id: parseInt(id) } });
        if (!oldTariff) {
            return res.status(404).json({ success: false, message: 'Tariff not found' });
        }

        const tariff = await prisma.electricityTariff.update({
            where: { id: parseInt(id) },
            data: {
                nama: data.nama !== undefined ? data.nama : oldTariff.nama,
                harga_per_kwh: data.harga_per_kwh !== undefined ? parseFloat(data.harga_per_kwh) : oldTariff.harga_per_kwh,
                tanggal_mulai: data.tanggal_mulai !== undefined ? new Date(data.tanggal_mulai) : oldTariff.tanggal_mulai,
                tanggal_selesai: data.tanggal_selesai !== undefined ? (data.tanggal_selesai ? new Date(data.tanggal_selesai) : null) : oldTariff.tanggal_selesai,
                isActive: data.isActive !== undefined ? data.isActive : oldTariff.isActive
            }
        });

        await logAudit(req, 'UPDATE_TARIFF', tariff.id, oldTariff, tariff);

        res.json({ success: true, data: tariff });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const oldTariff = await prisma.electricityTariff.findUnique({ where: { id: parseInt(id) } });
        
        const tariff = await prisma.electricityTariff.delete({
            where: { id: parseInt(id) }
        });

        await logAudit(req, 'DELETE_TARIFF', tariff.id, oldTariff, tariff);
        
        res.json({ success: true, message: 'Tariff deleted (soft)' });
    } catch (error) {
        next(error);
    }
};
