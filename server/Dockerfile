# Use official Node.js runtime image as base
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package lock and JSON files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copy backend files
COPY . .

# Expose server port
EXPOSE 5000

# Start Express Node server
CMD ["npm", "start"]
