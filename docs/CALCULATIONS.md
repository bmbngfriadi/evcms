# Calculations Logic

EVCMS uses a dedicated calculation engine (`chargingCalculationService.js`).

## A. SOC Added
`SOC Added = SOC After - SOC Before`

## B. Estimated Battery Energy Added
`Estimated Battery Energy Added = (SOC Added / 100) * Battery Capacity`

## C. Distance
`Distance = Current Odometer - Previous Charging Odometer`

## D. Estimated Vehicle Energy
`Estimated Vehicle Energy = (Distance * Dashboard Consumption) / 100`

## E. Estimated Charging Cost
`Estimated Charging Cost = Estimated Battery Energy Added * Electricity Tariff`

## F. Estimated Energy Cost
`Estimated Energy Cost = Estimated Vehicle Energy * Electricity Tariff`

## G. Cost Per KM
`Estimated Cost Per KM = Estimated Energy Cost / Distance`
