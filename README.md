# Uptime Monitor - Complete Monitoring Solution

A comprehensive uptime monitoring system with real-time alerts, multi-region monitoring, and advanced analytics.

## 🚀 Features

### ✅ Core Monitoring Engine

- **HTTP/HTTPS Monitoring**: Full support for different HTTP methods (GET, POST, DELETE, HEAD)
- **Custom Headers**: Add custom headers to requests
- **Expected Status Codes**: Configure expected HTTP status codes
- **Timeout Configuration**: Customizable timeout settings
- **Response Time Tracking**: Detailed response time metrics
- **Error Handling**: Comprehensive error detection and reporting

### ✅ Advanced Alert System

- **Multi-Channel Alerts**: Email, Slack, and Discord notifications
- **Smart Alert Escalation**: Progressive alerts based on downtime duration
- **Alert Customization**: Per-monitor alert settings
- **Spam Prevention**: Intelligent alert throttling
- **Recovery Notifications**: Automatic up notifications

### ✅ Real-Time Updates

- **WebSocket Integration**: Live status updates
- **Real-Time Dashboard**: Instant UI updates
- **Live Notifications**: Browser notifications for critical alerts
- **Status Change Detection**: Immediate status change notifications

### ✅ Geographic Monitoring

- **Multi-Region Support**: Monitor from different geographic locations
- **Location Tracking**: Store monitoring location data
- **Regional Analytics**: Performance data by region
- **Global Coverage**: Support for major AWS regions

### ✅ Status Pages

- **Public Status Pages**: Professional status pages for users
- **Custom Branding**: Logo, colors, and company information
- **Incident Management**: Public incident tracking
- **Uptime History**: Historical uptime data display
- **Real-Time Status**: Live service status updates

### ✅ Analytics & Reporting

- **Comprehensive Dashboard**: Key metrics and insights
- **Uptime Trends**: Historical uptime analysis
- **Response Time Analytics**: Performance monitoring
- **Geographic Performance**: Regional performance data
- **Export Capabilities**: Data export functionality

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

### Backend Setup

1. **Clone and navigate to backend:**

```bash
cd backend
npm install
```

2. **Configure Environment Variables:**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
MONGO_URL=mongodb://localhost:27017/uptime_monitor
SECRET=your-jwt-secret

# Email Configuration (choose one)
EMAIL_SERVICE=smtp
EMAIL_FROM=noreply@uptimemonitor.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Alternative Email Services
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=your-sendgrid-api-key

# EMAIL_SERVICE=mailgun
# MAILGUN_API_KEY=your-mailgun-api-key
# MAILGUN_DOMAIN=your-domain.com

# Geographic Monitoring
MONITORING_REGION=us-east-1
MONITORING_CITY=New York
MONITORING_COUNTRY=USA
MONITORING_LATITUDE=40.7128
MONITORING_LONGITUDE=-74.0060

# Frontend URL
FRONTEND_URL=http://localhost:5174
```

3. **Start Backend:**

```bash
npm run dev
```

### Frontend Setup

1. **Navigate to frontend:**

```bash
cd frontend
npm install
```

2. **Start Frontend:**

```bash
npm run dev
```

## 📧 Email Configuration

### SMTP (Default)

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### SendGrid

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Mailgun

```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.com
```

## 🌍 Geographic Monitoring

Configure monitoring locations in your `.env`:

```env
MONITORING_REGION=us-east-1
MONITORING_CITY=New York
MONITORING_COUNTRY=USA
MONITORING_LATITUDE=40.7128
MONITORING_LONGITUDE=-74.0060
```

Supported regions:

- `us-east-1` (N. Virginia)
- `us-west-1` (N. California)
- `us-west-2` (Oregon)
- `eu-west-1` (Ireland)
- `eu-central-1` (Frankfurt)
- `ap-southeast-1` (Singapore)
- `ap-northeast-1` (Tokyo)
- `sa-east-1` (São Paulo)

## 🚨 Alert Escalation

The system includes automatic alert escalation:

- **Level 1**: Immediate (Email + Slack)
- **Level 2**: 15 minutes (Email + Slack + Discord)
- **Level 3**: 1 hour (All channels)
- **Level 4**: 4 hours (All channels - Emergency)

## 🔧 API Endpoints

### Monitors

- `GET /api/monitors` - Get all monitors
- `POST /api/monitors` - Create monitor
- `PUT /api/monitors/:id` - Update monitor
- `DELETE /api/monitors/:id` - Delete monitor

### Status Pages

- `GET /api/status` - Get status pages
- `POST /api/status` - Create status page
- `GET /api/status/public/:slug` - Public status page

### Incidents

- `GET /api/incidents` - Get incidents
- `POST /api/monitors/:id/incidents` - Create incident
- `PUT /api/incidents/:id` - Update incident

### Analytics

- `GET /api/dashboard` - Dashboard stats
- `GET /api/monitors/:id/checks` - Monitor checks
- `GET /api/monitors/:id/uptime` - Uptime data

## 🎨 WebSocket Events

### Real-Time Updates

- `monitor-status-change` - Monitor status updates
- `status-update` - Individual status changes
- `incident-update` - Incident updates

### Room Management

- `join-user-room` - Join user-specific updates
- `join-monitor-room` - Join monitor-specific updates

## 📊 Database Schema

### Monitor

```javascript
{
  name: String,
  url: String,
  method: String,
  expectedStatusCode: Number,
  customHeaders: Array,
  intervalSeconds: Number,
  timeoutSeconds: Number,
  status: String,
  alertSettings: Object,
  // ... other fields
}
```

### Check

```javascript
{
  monitorId: ObjectId,
  success: Boolean,
  responseTimeMs: Number,
  statusCode: Number,
  location: Object,
  checkedAt: Date,
  // ... other fields
}
```

### Incident

```javascript
{
  monitorId: ObjectId,
  title: String,
  description: String,
  status: String,
  severity: String,
  updates: Array,
  // ... other fields
}
```

## 🚀 Deployment

### Production Build

```bash
# Backend
npm run build
npm start

# Frontend
npm run build
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGO_URL=mongodb://production-url
SECRET=strong-production-secret
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=production-api-key
```

## 🔒 Security Features

- JWT authentication
- Input validation with Zod
- Rate limiting
- CORS configuration
- Helmet security headers
- Password hashing with bcrypt

## 📈 Performance Optimizations

- Database indexing
- Connection pooling
- Caching with Redis
- Efficient query optimization
- Response compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, please create an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using React, TypeScript, Express, MongoDB, and Socket.io**
