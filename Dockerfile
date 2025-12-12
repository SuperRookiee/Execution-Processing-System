# Multi-purpose container for the NestJS API server and worker
FROM node:22-alpine

WORKDIR /usr/src/app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install

# Copy the remaining source code
COPY . .

# Expose the HTTP port used by the NestJS API
EXPOSE 3000

# Default command runs the API server; the worker uses a different command in docker-compose
CMD ["npm", "start"]
