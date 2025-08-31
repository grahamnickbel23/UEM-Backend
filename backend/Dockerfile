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

# Command to start the app
CMD ["npm", "run", "start"]
