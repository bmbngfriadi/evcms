const prisma = require('../prisma');
const { calculateCharging, validateInputs } = require('../services/chargingCalculationService');
const fs = require('fs');

const logAudit = async (req, action, recordId, oldValue, newValue) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action,
                module: 'CHARGING',
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
        const history = await prisma.chargingCycle.findMany({
            include: {
                vehicle: true,
                evidences: true
            },
            orderBy: { created_at: 'desc' }
        });
        const users = await prisma.user.findMany({ select: { id: true, name: true } });
        const userMap = {};
        users.forEach(u => userMap[u.id] = u.name);

        const historyWithUser = history.map(h => ({
            ...h,
            operator_name: h.operatorId ? userMap[h.operatorId] : '-'
        }));

        res.json({ success: true, data: historyWithUser });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cycle = await prisma.chargingCycle.findUnique({
            where: { id: parseInt(id) },
            include: {
                vehicle: true,
                evidences: true
            }
        });
        if (!cycle) {
            return res.status(404).json({ success: false, message: 'Charging cycle not found' });
        }

        let operator_name = '-';
        if (cycle.operatorId) {
            const operator = await prisma.user.findUnique({ where: { id: cycle.operatorId }, select: { name: true } });
            if (operator) operator_name = operator.name;
        }

        res.json({ success: true, data: { ...cycle, operator_name } });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { vehicleId, tanggal, waktu_mulai, soc_before, odometer, dashboard_consumption } = req.body;
        
        const vehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(vehicleId) } });
        if (!vehicle || !vehicle.isActive) {
            return res.status(400).json({ success: false, message: 'Vehicle not found or inactive' });
        }

        // Active tariff
        const tariff = await prisma.electricityTariff.findFirst({
            where: { isActive: true },
            orderBy: { created_at: 'desc' }
        });
        
        if (!tariff) {
            return res.status(400).json({ success: false, message: 'No active electricity tariff found' });
        }

        // Get previous completed charging for the same vehicle
        const previousCharging = await prisma.chargingCycle.findFirst({
            where: { 
                vehicleId: parseInt(vehicleId),
                status: 'COMPLETED'
            },
            orderBy: { waktu_selesai: 'desc' }
        });

        // Current partial data for validation
        const currentCharging = {
            soc_before: parseFloat(soc_before),
            odometer: parseInt(odometer),
            dashboard_consumption: parseFloat(dashboard_consumption)
        };

        // This will throw error if validation fails
        validateInputs(vehicle, currentCharging);

        let previous_odometer = null;
        let distance = null;
        if (previousCharging && previousCharging.odometer !== null) {
            previous_odometer = previousCharging.odometer;
            distance = parseInt(odometer) - previous_odometer;
            if (distance < 0) {
                return res.status(400).json({ success: false, message: 'Odometer saat ini tidak boleh kurang dari odometer sebelumnya' });
            }
        }

        const newCycle = await prisma.chargingCycle.create({
            data: {
                vehicleId: parseInt(vehicleId),
                operatorId: req.user.id,
                status: 'DRAFT',
                tanggal: new Date(tanggal),
                waktu_mulai: new Date(waktu_mulai),
                soc_before: parseFloat(soc_before),
                odometer: parseInt(odometer),
                dashboard_consumption: parseFloat(dashboard_consumption),
                previous_odometer: previous_odometer,
                distance: distance,
                // Snapshot
                battery_capacity_snapshot: vehicle.kapasitas_baterai,
                electricity_tariff_snapshot: tariff.harga_per_kwh
            }
        });

        await logAudit(req, 'CREATE_CHARGING', newCycle.id, null, newCycle);

        res.status(201).json({ success: true, data: newCycle });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cycle = await prisma.chargingCycle.findUnique({
            where: { id: parseInt(id) },
            include: { vehicle: true }
        });
        
        if (!cycle) {
            return res.status(404).json({ success: false, message: 'Charging cycle not found' });
        }

        const {
            tanggal,
            waktu_mulai,
            waktu_selesai,
            soc_before,
            soc_after,
            odometer,
            dashboard_consumption,
            status
        } = req.body;

        let calcData = {};
        if (cycle.status === 'COMPLETED' || status === 'COMPLETED') {
            const previousCharging = { odometer: cycle.previous_odometer };
            const currentCharging = {
                soc_before: soc_before !== undefined ? parseFloat(soc_before) : cycle.soc_before,
                soc_after: soc_after !== undefined ? parseFloat(soc_after) : cycle.soc_after,
                odometer: odometer !== undefined ? parseInt(odometer) : cycle.odometer,
                dashboard_consumption: dashboard_consumption !== undefined ? parseFloat(dashboard_consumption) : cycle.dashboard_consumption
            };
            const vehicleSnapshot = { kapasitas_baterai: cycle.battery_capacity_snapshot || cycle.vehicle.kapasitas_baterai };
            const tariffSnapshot = { harga_per_kwh: cycle.electricity_tariff_snapshot };

            try {
                if (currentCharging.soc_after !== null && currentCharging.soc_after !== undefined) {
                     const calcResult = calculateCharging(vehicleSnapshot, previousCharging, currentCharging, tariffSnapshot);
                     calcData = {
                        soc_added: calcResult.soc_added,
                        estimated_battery_energy_added: calcResult.estimated_battery_energy_added,
                        estimated_vehicle_energy: calcResult.estimated_vehicle_energy,
                        estimated_charging_cost: calcResult.estimated_charging_cost,
                        estimated_energy_cost: calcResult.estimated_energy_cost,
                        cost_per_km: calcResult.cost_per_km
                     };
                }
            } catch (calcError) {
                return res.status(400).json({ success: false, message: calcError.message });
            }
        }

        const dataToUpdate = {
            ...(tanggal && { tanggal: new Date(tanggal) }),
            ...(waktu_mulai && { waktu_mulai: new Date(waktu_mulai) }),
            ...(waktu_selesai && { waktu_selesai: new Date(waktu_selesai) }),
            ...(soc_before !== undefined && { soc_before: parseFloat(soc_before) }),
            ...(soc_after !== undefined && { soc_after: parseFloat(soc_after) }),
            ...(odometer !== undefined && { odometer: parseInt(odometer) }),
            ...(dashboard_consumption !== undefined && { dashboard_consumption: parseFloat(dashboard_consumption) }),
            ...(status && { status }),
            ...calcData
        };

        const updated = await prisma.chargingCycle.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });

        await logAudit(req, 'UPDATE_CHARGING', updated.id, cycle, updated);
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cycle = await prisma.chargingCycle.findUnique({ where: { id: parseInt(id) } });
        
        if (!cycle) {
            return res.status(404).json({ success: false, message: 'Charging cycle not found' });
        }

        await prisma.chargingCycle.delete({ where: { id: parseInt(id) } });
        await logAudit(req, 'DELETE_CHARGING', parseInt(id), cycle, null);

        res.json({ success: true, message: 'Charging cycle deleted' });
    } catch (error) {
        next(error);
    }
};

exports.start = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cycle = await prisma.chargingCycle.findUnique({ where: { id: parseInt(id) } });
        
        if (!cycle || cycle.status !== 'DRAFT') {
            return res.status(400).json({ success: false, message: 'Charging cycle must be in DRAFT status to start' });
        }

        const updated = await prisma.chargingCycle.update({
            where: { id: parseInt(id) },
            data: { status: 'CHARGING' }
        });

        await logAudit(req, 'UPDATE_CHARGING_STATUS', updated.id, { status: cycle.status }, { status: 'CHARGING' });

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

exports.cancel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cycle = await prisma.chargingCycle.findUnique({ where: { id: parseInt(id) } });
        
        if (!cycle || cycle.status === 'COMPLETED') {
            return res.status(400).json({ success: false, message: 'Cannot cancel completed charging' });
        }

        const updated = await prisma.chargingCycle.update({
            where: { id: parseInt(id) },
            data: { status: 'CANCELLED' }
        });

        await logAudit(req, 'CANCEL_CHARGING', updated.id, { status: cycle.status }, { status: 'CANCELLED' });

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

exports.finish = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { waktu_selesai, soc_after } = req.body;

        const cycle = await prisma.chargingCycle.findUnique({
            where: { id: parseInt(id) },
            include: { vehicle: true }
        });

        if (!cycle || cycle.status !== 'CHARGING') {
            return res.status(400).json({ success: false, message: 'Charging cycle must be in CHARGING status to finish' });
        }

        const previousCharging = {
            odometer: cycle.previous_odometer
        };

        const currentCharging = {
            soc_before: cycle.soc_before,
            soc_after: parseFloat(soc_after),
            odometer: cycle.odometer,
            dashboard_consumption: cycle.dashboard_consumption
        };

        const vehicleSnapshot = {
            kapasitas_baterai: cycle.battery_capacity_snapshot || cycle.vehicle.kapasitas_baterai
        };

        const tariffSnapshot = {
            harga_per_kwh: cycle.electricity_tariff_snapshot
        };

        let calcResult = {};
        try {
            calcResult = calculateCharging(vehicleSnapshot, previousCharging, currentCharging, tariffSnapshot);
        } catch (calcError) {
            return res.status(400).json({ success: false, message: calcError.message });
        }

        const updated = await prisma.chargingCycle.update({
            where: { id: parseInt(id) },
            data: {
                status: 'COMPLETED',
                waktu_selesai: new Date(waktu_selesai),
                soc_after: parseFloat(soc_after),
                soc_added: calcResult.soc_added,
                estimated_battery_energy_added: calcResult.estimated_battery_energy_added,
                estimated_vehicle_energy: calcResult.estimated_vehicle_energy,
                estimated_charging_cost: calcResult.estimated_charging_cost,
                estimated_energy_cost: calcResult.estimated_energy_cost,
                cost_per_km: calcResult.cost_per_km
            }
        });

        await logAudit(req, 'COMPLETE_CHARGING', updated.id, { status: cycle.status }, updated);

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

exports.uploadEvidence = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // SOC_BEFORE, SOC_AFTER, DASHBOARD

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const validTypes = ['SOC_BEFORE', 'SOC_AFTER'];
        if (!validTypes.includes(type)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Invalid evidence type' });
        }

        const cycle = await prisma.chargingCycle.findUnique({ where: { id: parseInt(id) } });
        if (!cycle) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Charging cycle not found' });
        }

        const evidence = await prisma.chargingEvidence.create({
            data: {
                chargingCycleId: parseInt(id),
                type,
                filename: req.file.filename,
                filepath: '/evcms/uploads/' + req.file.filename,
                mime_type: req.file.mimetype,
                file_size: req.file.size,
                uploaded_by: req.user.id
            }
        });

        await logAudit(req, 'UPLOAD_EVIDENCE', evidence.id, null, { type, filename: evidence.filename });

        res.json({ success: true, data: evidence });
    } catch (error) {
        next(error);
    }
};
