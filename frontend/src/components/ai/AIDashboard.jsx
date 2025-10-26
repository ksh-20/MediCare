import React, { useState } from 'react';
import ChatbotComponent from '../ai/ChatbotComponent';
import PillIdentificationComponent from '../ai/PillIdentificationComponent';
import FallDetectionComponent from '../ai/FallDetectionComponent';

export default function AIDashboard() {
  const [activeTab, setActiveTab] = useState('chatbot');

  return (
    <div>
      <h1>AI Services Dashboard</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('chatbot')}>Chatbot</button>
        <button onClick={() => setActiveTab('pill')}>Pill Identification</button>
        <button onClick={() => setActiveTab('fall')}>Fall Detection</button>
      </div>

      {activeTab === 'chatbot' && <ChatbotComponent />}
      {activeTab === 'pill' && <PillIdentificationComponent />}
      {activeTab === 'fall' && <FallDetectionComponent />}
    </div>
  );
}
