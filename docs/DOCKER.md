# Docker Configuration

The application is fully dockerized with 3 primary containers:

1. **evcms-postgres**: PostgreSQL 15 alpine container. Uses a persistent volume `postgres_data`.
2. **evcms-backend**: Node.js API server running on port 3000 internally. Uses `evcms_uploads` volume for photos.
3. **evcms-frontend**: Nginx server hosting the compiled Vite/React app and reverse proxying `/evcms/api/` requests to the backend. Mapped to port 80.

## Commands
Start all services:
```bash
docker-compose up -d
```

Stop services:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

Rebuild:
```bash
docker-compose build
```
