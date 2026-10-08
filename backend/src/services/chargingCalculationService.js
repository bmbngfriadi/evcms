/**
 * Charging Calculation Service
 */

/**
 * Validates inputs for charging calculation
 */
function validateInputs(vehicle, currentCharging) {
  if (!vehicle || !vehicle.kapasitas_baterai || vehicle.kapasitas_baterai <= 0) {
    throw new Error('Vehicle battery capacity is invalid');
  }

  if (currentCharging.soc_before < 0 || currentCharging.soc_before > 100) {
    throw new Error('SOC before must be between 0 and 100');
  }

  if (currentCharging.soc_after !== undefined && currentCharging.soc_after !== null) {
    if (currentCharging.soc_after < 0 || currentCharging.soc_after > 100) {
      throw new Error('SOC after must be between 0 and 100');
    }
    if (currentCharging.soc_after < currentCharging.soc_before) {
      throw new Error('SOC after must be greater than or equal to SOC before');
    }
  }

  if (currentCharging.odometer < 0) {
    throw new Error('Odometer cannot be negative');
  }

  if (currentCharging.dashboard_consumption <= 0) {
    throw new Error('Dashboard consumption must be greater than 0');
  }
}

/**
 * Calculates all parameters for a charging cycle
 * 
 * @param {Object} vehicle - The vehicle object from database snapshot
 * @param {Object} previousCharging - The previous COMPLETED charging cycle (can be null for the first charging)
 * @param {Object} currentCharging - The current charging data
 * @param {Object} tariff - The electricity tariff object
 * @returns {Object} - The calculated results
 */
function calculateCharging(vehicle, previousCharging, currentCharging, tariff) {
  validateInputs(vehicle, currentCharging);

  const results = {
    soc_added: null,
    distance: null,
    estimated_battery_energy_added: null,
    estimated_vehicle_energy: null,
    estimated_charging_cost: null,
    estimated_energy_cost: null,
    cost_per_km: null,
  };

  const batteryCapacity = parseFloat(vehicle.kapasitas_baterai);
  const socBefore = parseFloat(currentCharging.soc_before);
  const socAfter = currentCharging.soc_after !== undefined && currentCharging.soc_after !== null 
                    ? parseFloat(currentCharging.soc_after) 
                    : null;
  const currentOdometer = parseInt(currentCharging.odometer, 10);
  const dashboardConsumption = parseFloat(currentCharging.dashboard_consumption);
  const tariffPrice = tariff && tariff.harga_per_kwh ? parseFloat(tariff.harga_per_kwh) : 0;

  // A. SOC Added
  if (socAfter !== null) {
    results.soc_added = socAfter - socBefore;
  }

  // B. Estimated Battery Energy Added
  if (results.soc_added !== null) {
    results.estimated_battery_energy_added = (results.soc_added / 100) * batteryCapacity;
  }

  // C. Distance
  if (previousCharging && previousCharging.odometer !== undefined && previousCharging.odometer !== null) {
    const previousOdometer = parseInt(previousCharging.odometer, 10);
    if (currentOdometer < previousOdometer) {
      throw new Error('Odometer saat ini tidak boleh kurang dari odometer sebelumnya');
    }
    results.distance = currentOdometer - previousOdometer;
  }

  // D. Estimated Vehicle Energy
  if (results.distance !== null && results.distance >= 0) {
    results.estimated_vehicle_energy = (results.distance * dashboardConsumption) / 100;
  }

  // E. Estimated Charging Cost
  if (results.estimated_battery_energy_added !== null && tariffPrice > 0) {
    results.estimated_charging_cost = results.estimated_battery_energy_added * tariffPrice;
  }

  // F. Estimated Energy Cost
  if (results.estimated_vehicle_energy !== null && tariffPrice > 0) {
    results.estimated_energy_cost = results.estimated_vehicle_energy * tariffPrice;
  }

  // G. Cost Per KM
  if (results.estimated_energy_cost !== null && results.distance !== null && results.distance > 0) {
    results.cost_per_km = results.estimated_energy_cost / results.distance;
  }

  // Round values to appropriate decimals
  const round2 = (num) => num !== null ? Math.round((num + Number.EPSILON) * 100) / 100 : null;
  const round3 = (num) => num !== null ? Math.round((num + Number.EPSILON) * 1000) / 1000 : null;

  results.soc_added = round2(results.soc_added);
  results.estimated_battery_energy_added = round3(results.estimated_battery_energy_added);
  results.estimated_vehicle_energy = round3(results.estimated_vehicle_energy);
  results.estimated_charging_cost = round2(results.estimated_charging_cost);
  results.estimated_energy_cost = round2(results.estimated_energy_cost);
  results.cost_per_km = round2(results.cost_per_km);

  return results;
}

module.exports = {
  calculateCharging,
  validateInputs
};
