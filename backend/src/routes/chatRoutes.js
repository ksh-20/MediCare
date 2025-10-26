import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { message, context } = req.body;

    // Use the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = context
      ? `${context}\nUser: ${message}`
      : `User: ${message}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to connect to Gemini API" });
  }
});

export default router;
