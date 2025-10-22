# Use a lightweight Node.js image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker's cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all your source code (src, public, vite.config.ts, etc.)
COPY . .

# Run the build script from your package.json to create the 'dist' folder
RUN npm run build