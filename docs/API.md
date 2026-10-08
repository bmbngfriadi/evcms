# API Documentation

All APIs are prefixed with `/evcms/api`.

## Auth
- `POST /auth/login`: Authenticate and receive JWT token.

## Dashboard
- `GET /dashboard`: Get KPI metrics.

## Vehicles
- `GET /vehicles`: List all vehicles.
- `POST /vehicles`: Create a vehicle.
- `PUT /vehicles/:id`: Update a vehicle.
- `DELETE /vehicles/:id`: Soft delete a vehicle.

## Tariffs
- `GET /tariffs`: List tariffs.
- `POST /tariffs`: Create tariff.
- `PUT /tariffs/:id`: Update tariff.

## Charging
- `GET /charging`: List charging history.
- `GET /charging/:id`: Get detailed charging record.
- `POST /charging`: Create draft charging record.
- `POST /charging/:id/start`: Change status to CHARGING.
- `POST /charging/:id/finish`: Calculate values and complete charging.
- `POST /charging/:id/cancel`: Cancel charging.
- `POST /charging/:id/evidence`: Upload photo evidence (multipart/form-data).

## Users
- `GET /users`: List users.
- `POST /users`: Create user.
- `PUT /users/:id`: Update user.

## Audit Logs
- `GET /audit-logs`: List recent audit logs.
