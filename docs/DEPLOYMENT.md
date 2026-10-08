# Deployment to cg-plantbatam.com/evcms

## Steps
1. Clone the repository to your VPS.
2. Ensure Docker and Docker Compose are installed.
3. Configure `.env` using `.env.example`. Make sure `NODE_ENV=production`.
4. Build and start containers:
   ```bash
   docker-compose build
   docker-compose up -d
   ```
5. Configure your main reverse proxy (e.g., Nginx) on your host machine to route `/evcms` to the `evcms-frontend` container on port 80.

Example Nginx config on host:
```nginx
location /evcms/ {
    proxy_pass http://localhost:<frontend_port>/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```
Note: Ensure you don't expose PostgreSQL to the public internet. Use internal Docker networks.
