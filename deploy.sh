#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting deployment..."

# Build the Docker image
echo "📦 Building Docker image: frontend_inventory..."
docker build -t frontend_inventory .

# Create a temporary container
echo "🏗️ Creating temporary container..."
docker create --name temp-frontend_inventory frontend_inventory

# Copy the files to the web server directory
echo "🚚 Copying files to /var/www/frontend_inventory..."
# Using sudo for the next two commands as /var/www is owned by root
sudo mkdir -p /var/www/frontend-web
sudo docker cp temp-frontend_inventory:/app/dist/. /var/www/frontend-web/

# Clean up the container and image
echo "🧹 Cleaning up..."
docker rm temp-frontend_inventory
docker rmi frontend_inventory

echo "✅ Deployment successful!"