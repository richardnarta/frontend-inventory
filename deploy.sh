#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting deployment..."

# Build the Docker image
echo "📦 Building Docker image: frontend_hidupbaru..."
docker build -t frontend_hidupbaru .

# Create a temporary container
echo "🏗️ Creating temporary container..."
docker create --name temp-frontend_hidupbaru frontend_hidupbaru

# Copy the files to the web server directory
echo "🚚 Copying files to /var/www/frontend_hidupbaru..."
# Using sudo for the next two commands as /var/www is owned by root
sudo mkdir -p /var/www/frontend_hidupbaru
sudo docker cp temp-frontend_hidupbaru:/app/dist/. /var/www/frontend_hidupbaru/

# Clean up the container and image
echo "🧹 Cleaning up..."
docker rm temp-frontend_hidupbaru
docker rmi frontend_hidupbaru

echo "✅ Deployment successful!"