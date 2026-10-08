# Permissions

The system uses a granular role and permission system. Middlewares in the API ensure only authorized users access endpoints.

- **dashboard.view**: Access Dashboard
- **charging.view, .create, .edit, .delete**: Manage charging records
- **charging.start, .finish, .cancel**: Change charging cycle states
- **charging.upload_evidence**: Upload photos
- **vehicle.view, .create, .edit, .delete**: Manage vehicles
- **tariff.view, .create, .edit, .delete**: Manage electricity tariffs
- **report.view, .export**: Access reports
- **user.view, .create, .edit, .delete, .manage_permission**: Manage users
- **audit.view**: View audit logs
