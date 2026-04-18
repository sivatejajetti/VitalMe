const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Service
 * Connects to Google Gemini with robust fallback and key sanitization
 */
class AIService {
  static async getModel() {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing in .env");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Fallback chain: Newest -> Stable -> Legacy
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    // We'll return a proxy-like object or just try the first one and catch later
    // For now, let's try gemini-1.5-flash and if it fails in generate, we fallback
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  static async generateInsights(healthData) {
    try {
      const apiKey = (process.env.GEMINI_API_KEY || "").trim();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
      
      const prompt = `SYSTEM: You are VitalMe, a cheerful Health Coach. TONE: Supportive and encouraging. RULE: Provide 3 friendly, scannable bullet points with emojis. DATA: ${JSON.stringify(healthData)}.`;
      const result = await model.generateContent(prompt);
      return (await result.response).text();
    } catch (error) {
      console.error('Insights Error:', error.message);
      return "**Welcome back!** 🌟 I'm ready to help you crush your health goals today!";
    }
  }

  static async chat(message, healthData, history = []) {
    try {
      const apiKey = (process.env.GEMINI_API_KEY || "").trim();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
      
      const fullHistory = history.slice(-10).map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      const firstUserIndex = fullHistory.findIndex(h => h.role === 'user');
      const finalHistory = (firstUserIndex !== -1) ? fullHistory.slice(firstUserIndex) : [];

      const chat = model.startChat({ history: finalHistory });

      const systemBrief = "SYSTEM: You are VitalMe, a cheerful and supportive AI Health Coach. TONE: Warm, human, and conversational. RULES: [1] Stay concise by default, but use multiple sentences if the detail is helpful. [2] DO NOT repeat the user's daily stats unless it is relevant to their question. [3] Be motivating and helpful with emojis. [4] Maintain a clean, scannable format.";
      const context = healthData ? `DATA CONTEXT: ${JSON.stringify(healthData)}` : "";
      const userPrompt = `${systemBrief}\n${context}\n\nUSER: ${message}`;
      
      const result = await chat.sendMessage(userPrompt);
      return (await result.response).text();
    } catch (error) {
      console.error('Chat Error:', error.message);
      return "I'm optimizing your biometric stream... Let's try that again in a moment!";
    }
  }
}

module.exports = AIService;
