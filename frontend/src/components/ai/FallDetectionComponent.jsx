import React, { useState } from "react";
import { aiService } from "../../services/aiService";

// Icons (kept inline for portability)
const AlertTriangle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="w-6 h-6">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="w-6 h-6">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const FallDetectionComponent = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [sensitivity, setSensitivity] = useState("medium");

  const elderlyId = "E001"; // Example static ID

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await aiService.startMonitoring(elderlyId, sensitivity);
      setStatus(res.message || "Monitoring started. ML-based fall detection active.");
      setMonitoring(true);
    } catch (err) {
      console.error("Start monitoring error:", err);
      setStatus("❌ ERROR: Could not connect to ML fall detection backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await aiService.stopMonitoring(elderlyId);
      setStatus(res.message || "Monitoring stopped successfully.");
      setMonitoring(false);
    } catch (err) {
      console.error("Stop monitoring error:", err);
      setStatus("❌ ERROR: Failed to stop monitoring session.");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = monitoring ? "text-green-500" : "text-red-500";
  const statusBg = monitoring ? "bg-green-100" : "bg-red-100";
  const statusBorder = monitoring ? "border-green-500" : "border-red-500";
  const statusText = monitoring ? "Monitoring Active" : "Monitoring Stopped";

  return (
    <div className="w-full p-8 bg-gray-50 flex flex-col items-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-2xl bg-white p-10 rounded-2xl shadow-2xl border border-gray-100">

        <h2 className="text-3xl font-extrabold mb-4 text-gray-900 border-b pb-2">
          Fall Detection Dashboard
        </h2>
        <p className="text-gray-500 mb-8">
          Elderly ID: <span className="font-mono text-gray-700">{elderlyId}</span>
        </p>

        {/* Status Section */}
        <div className={`flex items-center justify-between p-6 mb-8 rounded-lg border-2 ${statusBg} ${statusBorder}`}>
          <div className="flex items-center gap-4">
            <div className={`${statusColor}`}>
              {monitoring ? <CheckCircle /> : <AlertTriangle />}
            </div>
            <div>
              <p className="text-xl font-bold tracking-wider text-gray-800">{statusText}</p>
              <p className={`text-sm font-semibold ${statusColor}`}>
                {monitoring
                  ? "Real-time ML fall detection active."
                  : "Awaiting monitoring initialization."}
              </p>
            </div>
          </div>
        </div>

        {/* Sensitivity Selector */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Sensitivity Level
          </label>
          <select
            value={sensitivity}
            onChange={(e) => setSensitivity(e.target.value)}
            disabled={monitoring}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 bg-white"
          >
            <option value="low">Low (less sensitive)</option>
            <option value="medium">Medium (default)</option>
            <option value="high">High (more sensitive)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleStart}
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition duration-300 transform shadow-md ${
              monitoring || loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02]"
            }`}
            disabled={monitoring || loading}
          >
            {loading && !monitoring ? "INITIALIZING..." : "START MONITORING"}
          </button>

          <button
            onClick={handleStop}
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition duration-300 transform shadow-md ${
              !monitoring || loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02]"
            }`}
            disabled={!monitoring || loading}
          >
            {loading && monitoring ? "STOPPING..." : "STOP MONITORING"}
          </button>
        </div>

        {/* Feedback Area */}
        {(loading || status) && (
          <div className="mt-8 p-4 w-full bg-gray-100 rounded-lg text-center border border-gray-300">
            {loading && (
              <p className="text-blue-600 font-medium flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500"
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
                    5.291A7.962 7.962 0 014 12H0c0 3.042 
                    1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing command...
              </p>
            )}
            {status && !loading && (
              <p
                className={`text-base font-medium ${
                  monitoring ? "text-green-800" : "text-red-800"
                }`}
              >
                {status}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FallDetectionComponent;
