# MediCare Assist Deployment Guide

## Overview

This guide covers deploying the MediCare Assist application across different environments and platforms.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (Vercel)      │◄──►│   (Render)      │◄──►│   (Render)      │
│   React.js      │    │   Node.js       │    │   Python        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Database      │    │   File Storage  │
│   (CloudFlare)  │    │   (MongoDB)     │    │   (AWS S3)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MongoDB Atlas account
- Vercel account
- Render account
- AWS account (for file storage)
- Google Cloud account (for Vision API)

## Environment Setup

### 1. Backend Environment Variables

Create `.env` file in the `backend` directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medicare-assist
DB_NAME=medicare_assist

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Server
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# AI Services
CHATBOT_SERVICE_URL=https://your-chatbot-service.onrender.com
PILL_ID_SERVICE_URL=https://your-pill-service.onrender.com
FALL_DETECTION_SERVICE_URL=https://your-fall-service.onrender.com
```

### 2. Frontend Environment Variables

Create `.env` file in the `frontend` directory:

```env
VITE_API_URL=https://your-backend-api.onrender.com/api
VITE_CHATBOT_URL=https://your-chatbot-service.onrender.com
VITE_PILL_ID_URL=https://your-pill-service.onrender.com
VITE_FALL_DETECTION_URL=https://your-fall-service.onrender.com
VITE_APP_NAME=MediCare Assist
VITE_APP_VERSION=1.0.0
```

### 3. AI Services Environment Variables

Create `.env` file in each AI service directory:

**Chatbot Service:**
```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
HUGGING_FACE_API_KEY=your-hugging-face-api-key
```

**Pill Identification Service:**
```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

**Fall Detection Service:**
```env
MODEL_PATH=models/
AUDIO_SAMPLE_RATE=16000
```

## Deployment Steps

### 1. Database Setup

1. Create a MongoDB Atlas cluster
2. Create a database named `medicare_assist`
3. Set up user authentication
4. Configure IP whitelist
5. Get connection string

### 2. Backend Deployment (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure build settings:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
4. Set environment variables
5. Deploy

### 3. Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Navigate to frontend directory: `cd frontend`
4. Deploy: `vercel --prod`
5. Configure environment variables in Vercel dashboard

### 4. AI Services Deployment (Render)

#### Chatbot Service
1. Create a new Web Service in Render
2. Configure build settings:
   - Build Command: `cd ai-services/chatbot && pip install -r requirements.txt`
   - Start Command: `cd ai-services/chatbot && python app.py`
3. Set environment variables
4. Deploy

#### Pill Identification Service
1. Create a new Web Service in Render
2. Configure build settings:
   - Build Command: `cd ai-services/pill-identification && pip install -r requirements.txt`
   - Start Command: `cd ai-services/pill-identification && python app.py`
3. Set environment variables
4. Deploy

#### Fall Detection Service
1. Create a new Web Service in Render
2. Configure build settings:
   - Build Command: `cd ai-services/fall-detection && pip install -r requirements.txt`
   - Start Command: `cd ai-services/fall-detection && python app.py`
3. Set environment variables
4. Deploy

## Production Configuration

### 1. Security

- Enable HTTPS for all services
- Configure CORS properly
- Use environment variables for secrets
- Implement rate limiting
- Set up monitoring and logging

### 2. Performance

- Enable gzip compression
- Configure CDN for static assets
- Optimize database queries
- Implement caching strategies
- Use connection pooling

### 3. Monitoring

- Set up application monitoring (e.g., New Relic, DataDog)
- Configure error tracking (e.g., Sentry)
- Set up uptime monitoring
- Implement health checks

### 4. Backup and Recovery

- Configure automated database backups
- Set up file storage backups
- Implement disaster recovery procedures
- Test backup restoration

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"serviceId": "your-service-id"}' \
            https://api.render.com/v1/services/your-service-id/deploys

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          vercel --token ${{ secrets.VERCEL_TOKEN }} --prod
```

## Scaling Considerations

### Horizontal Scaling

- Use load balancers for multiple instances
- Implement session management
- Configure database sharding
- Use microservices architecture

### Vertical Scaling

- Monitor resource usage
- Upgrade instance sizes as needed
- Optimize application performance
- Implement caching strategies

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check MongoDB Atlas whitelist
   - Verify connection string
   - Check network connectivity

2. **CORS Errors**
   - Verify CORS configuration
   - Check allowed origins
   - Ensure HTTPS is enabled

3. **AI Service Errors**
   - Check Python dependencies
   - Verify API keys
   - Monitor service logs

4. **Performance Issues**
   - Check database query performance
   - Monitor memory usage
   - Optimize image processing

### Logging

- Enable application logging
- Set up log aggregation
- Monitor error rates
- Track performance metrics

## Maintenance

### Regular Tasks

- Update dependencies
- Monitor security vulnerabilities
- Backup data
- Review performance metrics
- Update documentation

### Security Updates

- Keep all dependencies updated
- Monitor security advisories
- Implement security patches
- Conduct regular security audits

## Support

For deployment support:
- Email: deployment@medicare-assist.com
- Documentation: https://docs.medicare-assist.com
- Status Page: https://status.medicare-assist.com
