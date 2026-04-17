require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const list = await genAI.listModels();
    console.log("=== AVAILABLE MODELS FOR YOUR KEY ===");
    list.models.forEach(m => {
      console.log(`- ${m.name}`);
    });
    console.log("=====================================");
  } catch (e) {
    console.error("Discovery Error:", e.message);
  }
}

listModels();
