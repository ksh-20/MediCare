# MediCare Assist - Medicine Reminder System For Elderly People

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
- **Transformers (Hugging Face)** - NLP
- **OpenCV + Google Vision** - Computer vision
- **TensorFlow** - ML models
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
   ```bash
   # Copy environment files
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   cp ai-services/chatbot/.env.example ai-services/chatbot/.env
   cp ai-services/pill-identification/.env.example ai-services/pill-identification/.env
   cp ai-services/fall-detection/.env.example ai-services/fall-detection/.env
   ```

6. **Start Development Servers**
   ```bash
   # Terminal 1 - Frontend
   cd frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd backend
   npm run dev
   
   # Terminal 3 - AI Services
   cd ai-services/chatbot
   python app.py
   
   cd ../pill-identification
   python app.py
   
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
