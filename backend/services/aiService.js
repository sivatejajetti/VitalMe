const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');

/**
 * AI Service
 * Connects to Google Gemini with robust fallback, key sanitization,
 * and support for user-level OAuth developer credits.
 */
class AIService {
  static async getModel() {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing in .env");

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Dispatches the API request to Gemini, trying user-level OAuth token first,
   * then falling back to the server-side API key.
   */
  static async callGemini(payload, accessToken) {
    // 1. Try using the user's OAuth access token (utilizes their own developer credits)
    if (accessToken) {
      try {
        console.log("AIService: Attempting to call Gemini using User's Google OAuth access token...");
        const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        const response = await axios.post(
          url,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log("AIService: Successfully authenticated and called Gemini via User OAuth token.");
        return response.data.candidates[0].content.parts[0].text;
      } catch (error) {
        console.warn("AIService: User OAuth API call failed, falling back to server API key. Detail:", error.response?.data || error.message);
      }
    }

    // 2. Fallback: Use server-side GEMINI_API_KEY
    console.log("AIService: Utilizing server-side GEMINI_API_KEY...");
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      throw new Error("No valid OAuth token and GEMINI_API_KEY is missing in server environment");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(
      url,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  }

  static async generateInsights(healthData, accessToken) {
    try {
      const payload = {
        systemInstruction: {
          parts: [{ text: "You are VitalMe, a cheerful Health Coach. TONE: Supportive and encouraging. RULE: Provide 3 friendly, scannable bullet points with emojis." }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: `DATA: ${JSON.stringify(healthData)}` }]
          }
        ]
      };
      return await this.callGemini(payload, accessToken);
    } catch (error) {
      console.error('Insights Error:', error.message);
      return "**Welcome back!** 🌟 I'm ready to help you crush your health goals today!";
    }
  }

  static async chat(message, healthData, history = [], accessToken) {
    try {
      // Map chat history to Gemini structure
      const rawContents = history.slice(-10).map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      // Append current context and user message
      const context = healthData ? `DATA CONTEXT: ${JSON.stringify(healthData)}\n\n` : "";
      rawContents.push({
        role: "user",
        parts: [{ text: `${context}USER: ${message}` }]
      });

      // Filter to ensure strict alternation (user -> model -> user -> model) and starts with user
      let finalContents = [];
      let lastRole = null;
      
      const firstUserIndex = rawContents.findIndex(c => c.role === 'user');
      const filteredRaw = firstUserIndex !== -1 ? rawContents.slice(firstUserIndex) : rawContents;

      for (const msg of filteredRaw) {
        if (msg.role !== lastRole) {
          finalContents.push(msg);
          lastRole = msg.role;
        } else {
          // Merge consecutive messages of the same role
          if (finalContents.length > 0) {
            finalContents[finalContents.length - 1].parts[0].text += "\n" + msg.parts[0].text;
          } else {
            finalContents.push(msg);
            lastRole = msg.role;
          }
        }
      }

      const payload = {
        systemInstruction: {
          parts: [{ text: "You are VitalMe, a cheerful and supportive AI Health Coach. TONE: Warm, human, and conversational. RULES: [1] Stay concise by default, but use multiple sentences if the detail is helpful. [2] DO NOT repeat the user's daily stats unless it is relevant to their question. [3] Be motivating and helpful with emojis. [4] Maintain a clean, scannable format." }]
        },
        contents: finalContents
      };

      return await this.callGemini(payload, accessToken);
    } catch (error) {
      console.error('Chat Error:', error.message);
      return "I'm optimizing your biometric stream... Let's try that again in a moment!";
    }
  }
}

module.exports = AIService;
