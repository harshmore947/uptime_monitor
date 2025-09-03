# Deployment Guide

This guide covers deploying the Uptime Monitor application to production.

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Email service (SendGrid, Mailgun, or SMTP)
- Domain name (optional)
- SSL certificate (optional)

## Backend Deployment

### 1. Environment Setup

Create production `.env` file:

```env
NODE_ENV=production
PORT=3000
MONGO_URL=mongodb://your-production-mongo-url
SECRET=your-strong-production-secret

# Email Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# Geographic Monitoring
MONITORING_REGION=us-east-1
MONITORING_CITY=New York
MONITORING_COUNTRY=USA
MONITORING_LATITUDE=40.7128
MONITORING_LONGITUDE=-74.0060

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

### 2. Build and Deploy

```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Start production server
npm start
```

### 3. Process Manager (PM2)

Install PM2 for production process management:

```bash
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'uptime-monitor-backend',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Frontend Deployment

### 1. Build for Production

```bash
cd frontend
npm ci
npm run build
```

### 2. Environment Configuration

Create `.env.local`:

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_WS_URL=https://your-api-domain.com
```

### 3. Deploy Static Files

Serve the `dist` folder using any static file server:

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Apache Configuration:**

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /path/to/frontend/dist

    <Directory /path/to/frontend/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
</VirtualHost>
```

## Database Setup

### MongoDB Atlas (Cloud)

1. Create MongoDB Atlas cluster
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Update `MONGO_URL` in environment

### Local MongoDB

```bash
# Install MongoDB
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database
mongo
> use uptime_monitor
> db.createUser({user: "monitor", pwd: "password", roles: ["readWrite"]})
```

## SSL Configuration

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt-get install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update Nginx configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of configuration
}
```

## Monitoring & Logging

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# Logs
pm2 logs uptime-monitor-backend

# Restart application
pm2 restart uptime-monitor-backend
```

### Database Monitoring

```bash
# MongoDB monitoring
mongosh
> db.serverStatus()
> db.stats()
```

## Backup Strategy

### Database Backup

```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
mongodump --db uptime_monitor --out /backups/uptime_monitor_\$DATE
find /backups -name "uptime_monitor_*" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or AWS ELB
2. **Multiple Instances**: Run multiple backend instances
3. **Redis**: Add Redis for session storage and caching
4. **Database**: Use MongoDB replica set

### Performance Optimization

1. **Database Indexes**: Ensure proper indexing
2. **Caching**: Implement Redis caching
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable gzip compression

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets

## Troubleshooting

### Common Issues

1. **WebSocket Connection Issues**

   - Check CORS configuration
   - Verify WebSocket URL in frontend

2. **Email Not Sending**

   - Verify email service configuration
   - Check SMTP credentials
   - Review email service quotas

3. **Database Connection Issues**

   - Verify MongoDB connection string
   - Check network connectivity
   - Review MongoDB user permissions

4. **Performance Issues**
   - Monitor PM2 logs
   - Check database query performance
   - Review server resources

### Logs and Debugging

```bash
# View application logs
pm2 logs uptime-monitor-backend

# View MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Debug mode
NODE_ENV=development npm run dev
```

## Support

For deployment issues, check:

1. Application logs
2. Database connectivity
3. Network configuration
4. Environment variables
5. System resources
