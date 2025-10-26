import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, XCircle } from "lucide-react";

// FIX: Define a mock aiService to resolve the compilation error 
// and simulate the pill identification behavior.
const aiService = {
  identifyPill: async (file) => {
    // Simulate API delay (2 seconds for processing)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (file.size > 0) {
      // Successful identification mock
      const pillName = "Amlodipine Besylate 5mg";
      const description = "Identified as a Calcium Channel Blocker often used to treat high blood pressure and chest pain (angina). Please compare the markings and color to your physical pill.";
      return { 
        result: `${pillName}: ${description}` // Keeping result as a single string as per original component logic
      };
    } else {
      // Failed identification mock
      return { result: "Pill image was unclear. Please ensure the pill is well-lit and fully visible." };
    }
  },
};

const PillIdentificationComponent = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // 🎥 Toggle Camera Stream
  const toggleCamera = async () => {
    if (cameraActive) {
      stopCamera();
      return;
    }
    try {
      // Reset result when starting camera
      setImage(null);
      setResult("");

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Use a custom message box instead of alert
      setResult("SYSTEM ERROR: Unable to access camera. Please allow permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // 📸 Capture Image from Video Stream
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Stop camera immediately after capture attempt
    stopCamera();

    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const dataUrl = canvasRef.current.toDataURL("image/jpeg");
    setImage(dataUrl);

    // Convert base64 to file
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      identifyPill(file);
    } catch (e) {
       console.error("Capture processing error:", e);
       setResult("Processing Error: Could not convert captured image for identification.");
    }
  };

  // 🧠 Identify Pill (API Call)
  const identifyPill = async (file) => {
    setLoading(true);
    setResult("");
    try {
      const res = await aiService.identifyPill(file);
      setResult(res.result || "Pill not identified.");
    } catch (err) {
      console.error("Pill detection error:", err);
      setResult("NETWORK ERROR: Failed to communicate with the identification service.");
    } finally {
      setLoading(false);
    }
  };

  // 🗂️ Handle Manual File Upload
  const handleImageUpload = (e) => {
    // If camera is active, stop it
    if (cameraActive) stopCamera();
    setResult("");
    
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    identifyPill(file);
  };

  // 🧹 Cleanup camera when unmounted
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    // UI MODIFICATION: Full height, light theme, modern card design
    <div className="w-full p-8 bg-gray-50 flex flex-col items-center min-h-[calc(100vh-80px)]">
      
      {/* Main Card Container */}
      <div className="w-full max-w-3xl bg-white p-10 rounded-2xl shadow-2xl border border-gray-100">

        <h2 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-2 text-center">
            Pill Identification Scanner
        </h2>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <label className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full text-white font-semibold cursor-pointer flex items-center justify-center gap-2 transition transform hover:scale-105 shadow-lg">
            <Upload size={20} />
            Upload Pill Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={toggleCamera}
            className={`px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition transform hover:scale-105 shadow-lg ${
              cameraActive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            <Camera size={20} />
            {cameraActive ? "Stop Camera" : "Use Camera"}
          </button>
        </div>

        {/* Visualizer Area: Camera or Image */}
        <div className="flex justify-center items-center mb-8">
          {cameraActive ? (
            <div className="flex flex-col items-center">
              {/* Video Feed */}
              <video ref={videoRef} autoPlay playsInline className="rounded-xl border-4 border-dashed border-blue-400 w-full max-w-sm aspect-video object-cover shadow-inner" />
              <button
                onClick={capturePhoto}
                className="mt-4 bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-full font-bold text-gray-900 transition transform hover:scale-105 shadow-lg"
              >
                Capture & Identify
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : image ? (
            // Display Image
            <div className="relative w-full max-w-sm">
                <img
                  src={image}
                  alt="Uploaded or Captured Pill"
                  className="w-full aspect-square object-contain rounded-xl border-4 border-gray-300 shadow-xl"
                />
                <button 
                    onClick={() => {setImage(null); setResult("");}}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full text-red-500 shadow-md hover:text-red-700 transition"
                    title="Remove Image"
                >
                    <XCircle size={24} />
                </button>
            </div>
          ) : (
             // Placeholder when nothing is active
             <div className="w-full max-w-sm aspect-square flex items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 text-gray-500">
                Awaiting Pill Image
             </div>
          )}
        </div>

        {/* Loading or Result Display */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700 font-semibold">
            <Loader2 className="animate-spin" size={20} />
            Processing image and identifying pill...
          </div>
        ) : (
          result && (
            <div className={`p-4 rounded-lg shadow-inner ${result.startsWith('Error') || result.startsWith('NETWORK') || result.startsWith('SYSTEM') || result.startsWith('Processing Error') ? 'bg-red-100 border border-red-300 text-red-800' : 'bg-green-50 border border-green-300 text-green-800'}`}>
              <p className="font-bold mb-1">Identification Result:</p>
              <p className="whitespace-pre-wrap">{result}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PillIdentificationComponent;
