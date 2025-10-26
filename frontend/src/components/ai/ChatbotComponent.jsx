import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { aiService } from "../../services/aiService"; 


const ChatbotComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Auto scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND message handler
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input.trim() };
    const tempBotMsg = { sender: "bot", text: "Typing...", isPending: true };

    setMessages((prev) => [...prev, userMsg, tempBotMsg]);
    setInput("");
    setLoading(true);

    try {
      // ✅ Send message to backend FastAPI which connects to Gemini
      const res = await aiService.chat(userMsg.text, [], null);

      // Gemini API response (adjust based on backend return)
      const botReply = res.reply || res.response || "I'm here to help.";

      // Replace pending message with actual bot message
      setMessages((prev) =>
        prev.map((msg) => (msg.isPending ? { sender: "bot", text: botReply } : msg))
      );
    } catch (err) {
      console.error("Chatbot Error:", err);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isPending),
        { sender: "system", text: "⚠️ Error connecting to AI service." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Press Enter to send
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) handleSend();
  };

  return (
    <div className="w-full p-8 bg-gray-50 flex flex-col items-center min-h-[calc(100vh-80px)]">
      {/* Chat Card */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-xl flex flex-col h-[calc(100vh-120px)] border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-4 text-blue-800 border-b pb-2">
          💬 AI Chat Assistant
        </h2>

        {/* Chat Window */}
        <div className="flex-1 bg-gray-50 p-4 rounded-xl overflow-y-auto space-y-4 mb-4 border border-gray-200">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center mt-20 italic">
              Hello! I’m your AI Assistant. <br />
              Ask me about your schedule, medications, or general health tips.
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
                    ? `bg-gray-200 text-gray-800 rounded-tl-none ${
                        msg.isPending ? "opacity-70 animate-pulse" : ""
                      }`
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                <p className="font-semibold mb-1 text-xs opacity-70">
                  {msg.sender === "user"
                    ? "You"
                    : msg.sender === "bot"
                    ? "Gemini Assistant"
                    : "System"}
                </p>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="flex gap-3">
          <input
            type="text"
            className="flex-1 p-4 bg-white text-gray-900 rounded-full border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500 transition duration-150 placeholder-gray-500"
            placeholder={loading ? "Gemini is thinking..." : "Type your message..."}
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
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                  5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 
                  5.824 3 7.938l3-2.647z"
                ></path>
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
