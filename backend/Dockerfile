# Use official Node.js runtime as base image
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the backend code
COPY . .

# Expose the port your app runs on
EXPOSE 8000

#extra config for docker redis networking
ENV REDIS_HOST=redis-server \
    REDIS_PORT=6379

# Command to start the app
CMD ["npm", "run", "start"]
