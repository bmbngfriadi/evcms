const prisma = require('../prisma');

const logAudit = async (req, action, recordId, oldValue, newValue) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action,
                module: 'VEHICLE',
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
        const vehicles = await prisma.vehicle.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json({ success: true, data: vehicles });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const data = req.body;
        const vehicle = await prisma.vehicle.create({
            data: {
                kode: data.kode,
                nomor_polisi: data.nomor_polisi,
                merk: data.merk,
                model: data.model,
                tahun: parseInt(data.tahun),
                kapasitas_baterai: parseFloat(data.kapasitas_baterai),
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });
        
        await logAudit(req, 'CREATE_VEHICLE', vehicle.id, null, vehicle);
        
        res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const oldVehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(id) } });
        if (!oldVehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        const vehicle = await prisma.vehicle.update({
            where: { id: parseInt(id) },
            data: {
                kode: data.kode !== undefined ? data.kode : oldVehicle.kode,
                nomor_polisi: data.nomor_polisi !== undefined ? data.nomor_polisi : oldVehicle.nomor_polisi,
                merk: data.merk !== undefined ? data.merk : oldVehicle.merk,
                model: data.model !== undefined ? data.model : oldVehicle.model,
                tahun: data.tahun !== undefined ? parseInt(data.tahun) : oldVehicle.tahun,
                kapasitas_baterai: data.kapasitas_baterai !== undefined ? parseFloat(data.kapasitas_baterai) : oldVehicle.kapasitas_baterai,
                isActive: data.isActive !== undefined ? data.isActive : oldVehicle.isActive
            }
        });

        await logAudit(req, 'UPDATE_VEHICLE', vehicle.id, oldVehicle, vehicle);

        res.json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const oldVehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(id) } });
        
        // Soft delete
        const vehicle = await prisma.vehicle.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });

        await logAudit(req, 'DELETE_VEHICLE', vehicle.id, oldVehicle, vehicle);
        
        res.json({ success: true, message: 'Vehicle deleted (soft)' });
    } catch (error) {
        next(error);
    }
};
