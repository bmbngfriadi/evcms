FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

# Copy prisma schema specifically first
COPY prisma ./prisma/

# Generate prisma client
RUN npx prisma generate

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Start command
# We use a script to run migrations and then start the server
CMD ["npm", "run", "start:prod"]
