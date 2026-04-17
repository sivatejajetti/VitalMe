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
      
      // Try to get content with sequential model fallback
      const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
      let lastError = null;

      for (const modelName of models) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = `Health analysis: ${JSON.stringify(healthData)}. Provide 3 elite health insights.`;
          const result = await model.generateContent(prompt);
          return (await result.response).text();
        } catch (e) {
          lastError = e;
          if (e.message.includes("404")) continue; // Try next model
          throw e;
        }
      }
      throw lastError;
    } catch (error) {
      console.error('Insights Error:', error.message);
      return "Analyzing your trends... Looking solid! Keep up the movement.";
    }
  }

  static async chat(message, healthData, history = []) {
    try {
      const apiKey = (process.env.GEMINI_API_KEY || "").trim();
      const genAI = new GoogleGenerativeAI(apiKey);
      
      const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
      let lastError = null;

      for (const modelName of models) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const chat = model.startChat({
            history: history.slice(-6).map(h => ({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content }]
            })),
          });

          const systemPrompt = `Context: ${JSON.stringify(healthData)}. User: ${message}`;
          const result = await chat.sendMessage(systemPrompt);
          return (await result.response).text();
        } catch (e) {
          lastError = e;
          if (e.message.includes("404")) continue;
          throw e;
        }
      }
      throw lastError;
    } catch (error) {
      console.error('Chat Error:', error.message);
      return "I'm checking your pulse... Let's try that again!";
    }
  }
}

module.exports = AIService;
