const { calculateCharging } = require('../src/services/chargingCalculationService');

describe('Charging Calculation Service', () => {
  it('should correctly calculate charging cycle as per requirement phase 1', () => {
    const vehicle = {
      kapasitas_baterai: 71.8
    };

    const previousCharging = {
      odometer: 2400,
      soc_after: 90
    };

    const currentCharging = {
      soc_before: 16,
      soc_after: 80,
      odometer: 2579,
      dashboard_consumption: 12.9
    };

    const tariff = {
      harga_per_kwh: 1500
    };

    const result = calculateCharging(vehicle, previousCharging, currentCharging, tariff);

    // Expected:
    // SOC Added: 64%
    // Distance: 179 km
    // Estimated Battery Energy Added: 45.952 kWh
    // Estimated Vehicle Energy: 23.091 kWh
    // Estimated Charging Cost: Rp68,928
    // Estimated Energy Cost: Rp34,636.50
    // Cost/km: sekitar Rp193.50/km

    expect(result.soc_added).toBe(64);
    expect(result.distance).toBe(179);
    expect(result.estimated_battery_energy_added).toBeCloseTo(45.952, 3);
    expect(result.estimated_vehicle_energy).toBeCloseTo(23.091, 3);
    expect(result.estimated_charging_cost).toBe(68928);
    expect(result.estimated_energy_cost).toBe(34636.50);
    expect(result.cost_per_km).toBeCloseTo(193.50, 2);
  });
});
