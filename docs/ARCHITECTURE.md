# Architecture

## Components
1. **Frontend (React + Vite)**: 
   - Served by Nginx on path `/evcms/`.
   - Uses context for state management.
   - Communicates with API securely via JWT.
2. **Backend (Node.js + Express.js)**:
   - Hosted behind Nginx reverse proxy on path `/evcms/api`.
   - Uses Prisma ORM for database abstraction.
   - Includes custom Calculation Engine service.
3. **Database (PostgreSQL)**:
   - Contains all transaction and master data.
   - Uses persistent volumes.
4. **Storage**:
   - Local filesystem for evidence uploads with persistent Docker volume (`evcms_uploads`).
