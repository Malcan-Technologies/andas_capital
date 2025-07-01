#!/bin/bash

# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Create website directory
sudo mkdir -p /var/www/growkapital
sudo chown -R $USER:$USER /var/www/growkapital

# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/growkapital
sudo ln -s /etc/nginx/sites-available/growkapital /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Install PM2 globally
sudo npm install -pm2@latest -g

# Build the Next.js application
npm install
npm run build

# Start the application with PM2
pm2 start npm --name "growkapital" -- start

# Setup PM2 to start on boot
pm2 startup
pm2 save

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Setup SSL certificate
sudo certbot --nginx -d kredit.my -d www.kredit.my -d admin.kredit.my -d api.kredit.my

echo "Deployment completed! Your website should now be accessible at https://kredit.my" 