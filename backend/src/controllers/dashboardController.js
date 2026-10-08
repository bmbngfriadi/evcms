const prisma = require('../prisma');
const { format } = require('date-fns');

exports.getDashboard = async (req, res, next) => {
    try {
        const chargingCycles = await prisma.chargingCycle.findMany({
            where: { status: 'COMPLETED' },
            select: {
                tanggal: true,
                distance: true,
                dashboard_consumption: true,
                estimated_battery_energy_added: true,
                estimated_charging_cost: true,
                estimated_energy_cost: true,
                cost_per_km: true,
                soc_added: true
            },
            orderBy: {
                tanggal: 'asc'
            }
        });

        const totalVehicles = await prisma.vehicle.count({ where: { isActive: true } });
        
        let totalDistance = 0;
        let sumConsumption = 0;
        let countConsumption = 0;
        let totalEstimatedEnergy = 0;
        let totalEstimatedChargingCost = 0;
        let sumSocAdded = 0;
        let countSocAdded = 0;
        
        // Prepare monthly chart data
        const monthlyChartMap = {};

        chargingCycles.forEach(cycle => {
            if (cycle.distance) totalDistance += cycle.distance;
            if (cycle.dashboard_consumption) {
                sumConsumption += parseFloat(cycle.dashboard_consumption);
                countConsumption++;
            }
            if (cycle.estimated_battery_energy_added) totalEstimatedEnergy += parseFloat(cycle.estimated_battery_energy_added);
            if (cycle.estimated_charging_cost) totalEstimatedChargingCost += parseFloat(cycle.estimated_charging_cost);
            if (cycle.soc_added) {
                sumSocAdded += parseFloat(cycle.soc_added);
                countSocAdded++;
            }
            
            if (cycle.tanggal) {
                const monthKey = format(new Date(cycle.tanggal), 'MMM yyyy');
                if (!monthlyChartMap[monthKey]) {
                    monthlyChartMap[monthKey] = { 
                        month: monthKey, 
                        total_charging: 0, 
                        total_distance: 0, 
                        total_cost: 0, 
                        sum_consumption: 0,
                        count_consumption: 0
                    };
                }
                monthlyChartMap[monthKey].total_charging += 1;
                monthlyChartMap[monthKey].total_distance += cycle.distance || 0;
                monthlyChartMap[monthKey].total_cost += parseFloat(cycle.estimated_charging_cost) || 0;
                if (cycle.dashboard_consumption) {
                    monthlyChartMap[monthKey].sum_consumption += parseFloat(cycle.dashboard_consumption);
                    monthlyChartMap[monthKey].count_consumption += 1;
                }
            }
        });

        const monthlyChartData = Object.values(monthlyChartMap).map(data => ({
            ...data,
            avg_consumption: data.count_consumption > 0 ? parseFloat((data.sum_consumption / data.count_consumption).toFixed(2)) : 0
        }));

        const averageConsumption = countConsumption > 0 ? (sumConsumption / countConsumption).toFixed(2) : 0;
        const averageCostPerKm = totalDistance > 0 ? (totalEstimatedChargingCost / totalDistance).toFixed(2) : 0;
        const averageSocAdded = countSocAdded > 0 ? (sumSocAdded / countSocAdded).toFixed(2) : 0;

        res.json({
            success: true,
            data: {
                totalChargingCycle: chargingCycles.length,
                totalVehicles,
                totalDistance,
                averageConsumption: parseFloat(averageConsumption),
                totalEstimatedEnergy: parseFloat(totalEstimatedEnergy.toFixed(2)),
                totalEstimatedChargingCost: parseFloat(totalEstimatedChargingCost.toFixed(2)),
                averageCostPerKm: parseFloat(averageCostPerKm),
                averageSocAdded: parseFloat(averageSocAdded),
                monthlyChartData
            }
        });
    } catch (error) {
        next(error);
    }
};

