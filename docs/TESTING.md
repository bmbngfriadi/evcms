# Testing Guide

## Unit Tests
The core calculation engine has unit tests configured with Jest.
To run the tests, execute the following command inside the `backend` directory:
```bash
npm run test
```

## Test Case Output Example
Based on Phase 1 requirements:
- Battery Capacity: 71.8 kWh
- Previous SOC: 90%
- Current SOC Before: 16%
- Current SOC After: 80%
- Odometer: 2579 km
- Dashboard Consumption: 12.9 kWh/100km
- Tariff: Rp1,500/kWh

Expected:
- SOC Added: 64%
- Distance: 179 km
- Estimated Battery Energy Added: 45.952 kWh
- Estimated Vehicle Energy: 23.091 kWh
- Estimated Charging Cost: Rp68,928
- Estimated Energy Cost: Rp34,636.50
- Cost/km: Rp193.50
