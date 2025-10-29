# MediCare - Medicine Reminder System For Elderly People

A comprehensive caregiver-managed web application that ensures timely medication intake for elderly individuals through automated reminders and AI-powered features.

## Features

### 🏥 Caregiver Portal
- Secure authentication with JWT
- Create and manage personalized medication schedules
- View adherence logs and missed-dose alerts
- Real-time dashboard with statistics

### 🔔 Automated Reminders
- SMS reminders via Twilio API
- Browser audio alarms using Howler.js
- Offline-capable reminder system

### 📊 Real-Time Tracking
- Automatic medication adherence logging
- Instant missed-dose alerts to caregivers
- Comprehensive reporting system

### 🤖 AI-Powered Features
- Natural language chatbot for medication queries
- Pill identification using computer vision
- Audio-based fall detection
- Distress keyword detection

### 🔒 Security & Compliance
- HIPAA-compliant data encryption
- Role-based access control
- Secure API endpoints

## Tech Stack

### Frontend
- **React.js** - UI framework
- **CSS** - UI Styling
- **Tailwind CSS** - Advanced UI Styling
- **Recharts** - Data visualization
- **Howler.js** - Audio management
- **react-pdf** - Report generation

### Backend
- **Node.js + Express.js** - API server
- **MongoDB** - Database
- **JWT** - Authentication
- **Twilio** - SMS service

### AI Services
- **Python + FastAPI** - AI service layer
- **Transformers (Hugging Face)** - Natural Language Processing Chatbot
- **Gemini API** - Advanced Chatbot
- **OpenCV + Google Vision** - Computer Vision
- **TensorFlow** - Machine Learning Model
- **Librosa** - Audio processing

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting

## Project Structure

```
medicare-assist/
├── frontend/          # React.js Frontend
├── backend/           # Node.js + Express Backend
├── ai-services/       # Python AI/ML Services
├── database/          # Database schemas and seed data       
└── docs/              # Documentation
```

## Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB
- Twilio account
- Google Cloud Vision API key
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ksh-20/MediCare
   cd medicare-assist
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   npm install @react-pdf/renderer
   npm install react-hot-toast --legacy-peer-deps
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
   Add the following to top of src/styles/globals.css

   ```bash
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

   Add the following line after the meta tags to the index.html file

   ```bash
   <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
   ```


3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   npm install @google/generative-ai
   ```

4. **Install AI Services Dependencies**
   ```bash
   cd ../ai-services/chatbot
   pip install -r requirements.txt
   
   cd ../pill-identification
   pip install -r requirements.txt
   
   cd ../fall-detection
   pip install -r requirements.txt
   ```

5. **Environment Setup**
   
   Backend env - Replace '...' with actual values, use the following command to generate jwt secret and refresh secret tokens(run it once for each)

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" #for windows powershell
   ```

   ```bash
   MONGODB_URI=...
   JWT_SECRET=...
   JWT_REFRESH_SECRET=...
   PORT=5000
   CORS_ORIGIN=http://localhost:5173
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=...
   CHATBOT_SERVICE_URL=http://localhost:8001 
   PILL_ID_SERVICE_URL=http://localhost:8002 
   FALL_DETECTION_SERVICE_URL=http://localhost:8003
   GEMINI_API_KEY=...
   ```

   Go to https://aistudio.google.com/app/api-keys to create Gemini API Key.

   Frontend env

   ```bash
   VITE_API_URL=http://localhost:5000/api
   VITE_CHATBOT_URL=http://localhost:8001
   VITE_PILL_ID_URL=http://localhost:8002
   VITE_FALL_DETECTION_URL=http://localhost:8003
   ```

6. **Start Development Servers**
   ```bash
   # Terminal 1 - Frontend
   cd frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd backend
   npm run dev
   
   # Terminal 3 - NLP Service
   cd ai-services/chatbot
   python app.py

   # Terminal 4 - CV Service
   cd ../pill-identification
   python app.py
   
   # Terminal 5 - ML Service
   cd ../fall-detection
   python app.py
   ```

## API Documentation

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Chatbot API: http://localhost:8001
- Pill Identification API: http://localhost:8002
- Fall Detection API: http://localhost:8003

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request


## Support

For support, email kshitij24.srinivasan@gmail.com or create an issue in the repository.
