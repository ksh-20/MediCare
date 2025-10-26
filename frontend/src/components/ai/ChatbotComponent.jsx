import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

// FIX: Define a mock aiService to resolve the compilation error 
// and simulate the chat behavior.
const aiService = {
  chat: async (userQuery) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple placeholder response logic
    let botResponse = `Thank you for asking about "${userQuery}". I am here to assist with general information. Please remember to consult a medical professional for personal health advice.`;

    if (userQuery.toLowerCase().includes('medication') || userQuery.toLowerCase().includes('dosage')) {
        botResponse = "I can provide general information about medications, but for any questions regarding your specific dosage or treatment plan, always speak to your doctor or pharmacist.";
    } else if (userQuery.toLowerCase().includes('schedule')) {
        botResponse = "I can help you review your schedule. Are you looking to set a reminder or check today's appointments?";
    }
    
    return { reply: botResponse };
  }
}


const ChatbotComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages]);


  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { sender: "user", text: input.trim() };
    const optimisticBotMsg = { sender: "bot", text: "...", isPending: true };
    
    // Optimistically add user message and pending bot message
    setMessages((prev) => [...prev, userMsg, optimisticBotMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await aiService.chat(userMsg.text);
      const botMsg = { sender: "bot", text: res.reply || "No response" };
      
      // Replace the pending message with the actual response
      setMessages((prev) => 
        prev.map(msg => 
          msg.isPending ? botMsg : msg
        )
      );

    } catch (err) {
      console.error("Chatbot error:", err);
      // Remove the failed pending message and add an error message
      setMessages((prev) => [
        ...prev.filter(msg => !msg.isPending), 
        { sender: "system", text: "Error: Could not connect to assistant." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSend();
    }
  }

  return (
    // UI MODIFICATION: Full height, light theme, modern card design
    <div className="w-full p-8 bg-gray-50 flex flex-col items-center min-h-[calc(100vh-80px)]">
      
      {/* Main Chat Card Container */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-xl flex flex-col h-[calc(100vh-120px)] border border-gray-100">

        <h2 className="text-3xl font-extrabold mb-4 text-blue-800 border-b pb-2">
            AI Chat Assistant
        </h2>

        {/* Chat Messages Display */}
        <div className="flex-1 bg-gray-50 p-4 rounded-xl overflow-y-auto space-y-4 mb-4 border border-gray-200">
          
          {messages.length === 0 && (
            <p className="text-gray-400 text-center mt-20 italic">
              Hello! I'm your AI assistant. Ask me anything about your schedule, medications, or general health concerns.
            </p>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-xl shadow-md ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : msg.sender === "bot"
                    ? `bg-gray-200 text-gray-800 rounded-tl-none ${msg.isPending ? 'opacity-70 animate-pulse' : ''}`
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                <p className="font-semibold mb-1 text-xs opacity-80">
                    {msg.sender === 'user' ? 'You' : msg.sender === 'bot' ? 'Assistant' : 'System'}
                </p>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <input
            className="flex-1 p-4 bg-white text-gray-800 rounded-full border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500 transition duration-150"
            placeholder={loading ? "Waiting for response..." : "Type your message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 p-4 rounded-full text-white flex items-center justify-center transition duration-150 transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
          >
            {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotComponent;
