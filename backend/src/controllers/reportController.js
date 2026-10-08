const prisma = require('../prisma');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

exports.getReportData = async (req, res, next) => {
    try {
        const chargingData = await prisma.chargingCycle.findMany({
            where: { status: 'COMPLETED' },
            include: { vehicle: true }
        });

        // Basic aggregation by vehicle
        const aggregated = {};
        let totalEnergy = 0;
        let totalCost = 0;

        chargingData.forEach(c => {
            const vKode = c.vehicle.kode;
            if (!aggregated[vKode]) {
                aggregated[vKode] = { 
                    vehicle_kode: vKode,
                    nomor_polisi: c.vehicle.nomor_polisi,
                    total_distance: 0,
                    total_energy: 0,
                    total_cost: 0,
                    charge_count: 0
                };
            }
            aggregated[vKode].total_distance += (c.distance || 0);
            aggregated[vKode].total_energy += parseFloat(c.estimated_battery_energy_added || 0);
            aggregated[vKode].total_cost += parseFloat(c.estimated_charging_cost || 0);
            aggregated[vKode].charge_count += 1;

            totalEnergy += parseFloat(c.estimated_battery_energy_added || 0);
            totalCost += parseFloat(c.estimated_charging_cost || 0);
        });

        res.json({
            success: true,
            data: {
                summary: { totalEnergy, totalCost, totalCycles: chargingData.length },
                byVehicle: Object.values(aggregated)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.exportExcel = async (req, res, next) => {
    try {
        const chargingData = await prisma.chargingCycle.findMany({
            where: { status: 'COMPLETED' },
            include: { 
                vehicle: true,
                evidences: true 
            },
            orderBy: { waktu_selesai: 'desc' }
        });

        // get users for operator
        const users = await prisma.user.findMany({ select: { id: true, name: true } });
        const userMap = {};
        users.forEach(u => userMap[u.id] = u.name);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = req.user.name;
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Laporan Detail Charging');

        // 1. HEADER: User details
        sheet.mergeCells('A1:G1');
        sheet.getCell('A1').value = 'LAPORAN DETAIL SIKLUS CHARGING KENDARAAN LISTRIK';
        sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF000000' } };
        
        sheet.getCell('A3').value = 'Diekstrak Oleh:';
        sheet.getCell('B3').value = req.user.name;
        sheet.getCell('A4').value = 'Role:';
        sheet.getCell('B4').value = req.user.role ? req.user.role.name : '-';
        sheet.getCell('A5').value = 'Waktu Ekstrak:';
        sheet.getCell('B5').value = new Date().toLocaleString('id-ID');
        sheet.getCell('A6').value = 'Total Data:';
        sheet.getCell('B6').value = `${chargingData.length} Siklus Selesai`;

        ['A3','A4','A5','A6'].forEach(c => {
            sheet.getCell(c).font = { bold: true };
        });

        // 2. Table Headers
        const headers = [
            'No', 'Waktu Mulai', 'Waktu Selesai', 'Kendaraan', 'Odometer (km)', 'Jarak (km)', 
            'Dash Cons (kWh/100km)', 'SOC Before', 'SOC After', 'SOC Added', 
            'Est. Battery Energy (kWh)', 'Est. Vehicle Energy (kWh)', 'Tarif (Rp/kWh)', 
            'Est. Biaya Charging', 'Est. Biaya Energi', 'Cost/km', 'Operator',
            'Foto SOC Before', 'Foto SOC After'
        ];
        
        const headerRow = sheet.getRow(8);
        headers.forEach((h, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = h;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111827' } }; // Dark gray/black
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        });

        // Set proportional column widths
        sheet.columns = [
            { width: 5 },  // No
            { width: 20 }, // Waktu Mulai
            { width: 20 }, // Waktu Selesai
            { width: 22 }, // Kendaraan
            { width: 15 }, // Odo
            { width: 12 }, // Jarak
            { width: 18 }, // Dash Cons
            { width: 12 }, // SOC Before
            { width: 12 }, // SOC After
            { width: 12 }, // SOC Added
            { width: 15 }, // Est Batt
            { width: 15 }, // Est Veh
            { width: 15 }, // Tarif
            { width: 20 }, // Biaya Charg
            { width: 20 }, // Biaya Ener
            { width: 15 }, // Cost/km
            { width: 20 }, // Operator
            { width: 45 }, // Foto 1
            { width: 45 }  // Foto 2
        ];

        let currentRow = 9;
        
        // Helper to add image
        const addImg = (filepath, colIndex) => {
            try {
                // filename is something like evidence-12345.png
                // filepath in db is /evcms/uploads/evidence-...
                const fileName = filepath.split('/').pop();
                const uploadDir = process.env.UPLOAD_DIR || 'uploads';
                const fullPath = path.resolve(__dirname, '..', '..', uploadDir, fileName);
                
                if (fs.existsSync(fullPath)) {
                    const ext = path.extname(fullPath).toLowerCase().substring(1);
                    const imageId = workbook.addImage({
                        filename: fullPath,
                        extension: ext === 'png' ? 'png' : 'jpeg',
                    });
                    
                    sheet.addImage(imageId, {
                        tl: { col: colIndex + 0.05, row: currentRow - 1 + 0.05 }, // Add 5% padding
                        br: { col: colIndex + 1 - 0.05, row: currentRow - 0.05 },
                        editAs: 'oneCell'
                    });
                }
            } catch (e) {
                console.error('Error attaching image', e);
            }
        };

        for (let i = 0; i < chargingData.length; i++) {
            const data = chargingData[i];
            const row = sheet.getRow(currentRow);
            
            row.height = 180; // 180 points high for images to be very visible
            
            row.getCell(1).value = i + 1;
            row.getCell(2).value = new Date(data.waktu_mulai).toLocaleString('id-ID');
            row.getCell(3).value = data.waktu_selesai ? new Date(data.waktu_selesai).toLocaleString('id-ID') : '-';
            row.getCell(4).value = `${data.vehicle.kode}\n${data.vehicle.nomor_polisi}`;
            row.getCell(5).value = data.odometer;
            row.getCell(6).value = data.distance;
            row.getCell(7).value = parseFloat(data.dashboard_consumption);
            row.getCell(8).value = `${parseFloat(data.soc_before)}%`;
            row.getCell(9).value = data.soc_after ? `${parseFloat(data.soc_after)}%` : '-';
            row.getCell(10).value = data.soc_added ? `${parseFloat(data.soc_added)}%` : '-';
            row.getCell(11).value = data.estimated_battery_energy_added ? parseFloat(data.estimated_battery_energy_added) : 0;
            row.getCell(12).value = data.estimated_vehicle_energy ? parseFloat(data.estimated_vehicle_energy) : 0;
            row.getCell(13).value = data.electricity_tariff_snapshot ? parseFloat(data.electricity_tariff_snapshot) : 0;
            row.getCell(14).value = data.estimated_charging_cost ? parseFloat(data.estimated_charging_cost) : 0;
            row.getCell(15).value = data.estimated_energy_cost ? parseFloat(data.estimated_energy_cost) : 0;
            row.getCell(16).value = data.cost_per_km ? parseFloat(data.cost_per_km) : 0;
            row.getCell(17).value = data.operatorId ? userMap[data.operatorId] : '-';

            // Add images (colIndex is 0-based for tl.col)
            // Foto SOC Before -> col 18 in Excel, so colIndex = 17
            const socBeforeImg = data.evidences.find(e => e.type === 'SOC_BEFORE' || e.type === 'DASHBOARD');
            if (socBeforeImg) addImg(socBeforeImg.filepath, 17);
            
            // Foto SOC After -> col 19, colIndex = 18
            const socAfterImg = data.evidences.find(e => e.type === 'SOC_AFTER');
            if (socAfterImg) addImg(socAfterImg.filepath, 18);

            // style formatting
            for(let c=1; c<=19; c++){
                const cell = row.getCell(c);
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
            }
            
            // Format currency
            row.getCell(13).numFmt = '"Rp"#,##0.00';
            row.getCell(14).numFmt = '"Rp"#,##0.00';
            row.getCell(15).numFmt = '"Rp"#,##0.00';
            row.getCell(16).numFmt = '"Rp"#,##0.00';

            currentRow++;
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_EVCMS_${new Date().getTime()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};
