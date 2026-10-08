# Database Schema

## Tables
- `users`: Administrator, Operators, HRGA (id, email, name, password, roleId, isActive)
- `roles`: Role definitions (id, name, description)
- `permissions`: Granular permissions (id, name, description)
- `role_permissions`: Join table for roles and permissions
- `user_permissions`: Join table for specific user permission overrides
- `vehicles`: Master data kendaraan (id, kode, nomor_polisi, merk, model, tahun, kapasitas_baterai, isActive)
- `electricity_tariffs`: Master data tarif listrik (id, nama, harga_per_kwh, tanggal_mulai, tanggal_selesai, isActive)
- `charging_cycles`: Transaction table for charging (id, vehicleId, status, operatorId, soc_before, soc_after, odometer, previous_odometer, distance, dashboard_consumption, calculated values..., snapshot values)
- `charging_evidences`: Images uploaded during charging (id, chargingCycleId, type, filepath)
- `audit_logs`: Application activity logging (id, userId, action, module, record_id)
