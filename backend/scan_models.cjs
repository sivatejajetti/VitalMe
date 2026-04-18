const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: './.env' });

async function scanModels() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  console.log("Inquiring Google for authorized models...");
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("AUTHORIZED MODELS FOUND:");
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log("No models returned. API response:", JSON.stringify(data));
    }
  } catch (e) {
    console.log("Inquiry Error:", e.message);
  }
}

scanModels();
