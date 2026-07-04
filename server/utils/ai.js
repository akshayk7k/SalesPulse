import axios from "axios";

export async function callLLM(messages, options = {}) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTERDEEPSEEK;

  // 1. Google Gemini API (First choice) — tries multiple models in order
  if (geminiKey && geminiKey !== "your_gemini_api_key_here") {
    const geminiModels = [
      "gemini-2.5-flash",
      "gemini-flash-lite-latest",
      "gemini-2.0-flash",
    ];

    const systemMessage = messages.find(m => m.role === "system");
    const contents = messages
      .filter(m => m.role !== "system")
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content || "" }]
      }));

    if (contents.length === 0 && systemMessage) {
      contents.push({ role: "user", parts: [{ text: systemMessage.content }] });
    }

    const payload = { contents, generationConfig: {} };
    if (systemMessage) {
      payload.systemInstruction = { parts: [{ text: systemMessage.content }] };
    }

    const requiresJson = options.json ||
      messages.some(m => m.content && (
        m.content.toLowerCase().includes("json format") ||
        m.content.toLowerCase().includes("strictly in json")
      ));
    if (requiresJson) {
      payload.generationConfig.responseMimeType = "application/json";
    }

    for (const model of geminiModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const response = await axios.post(url, payload, {
          headers: { "Content-Type": "application/json" }
        });
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`Gemini response from model: ${model}`);
          return text;
        }
        throw new Error("Empty response from Gemini API");
      } catch (err) {
        const status = err.response?.status;
        console.warn(`Gemini [${model}] failed (${status || err.message}), trying next...`);
        // 429 = quota exceeded for this model, try next
        // 503 = overloaded, try next
        // other errors: also try next
      }
    }
    console.error("All Gemini models failed. Falling back to OpenRouter.");
  }

  // 2. OpenRouter DeepSeek (Second choice)
  if (openRouterKey && openRouterKey !== "your_openrouter_deepseek_api_key_here") {
    try {
      const payload = {
        model: "openrouter/free",
        messages
      };
      const headers = {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json"
      };
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        payload,
        { headers }
      );
      return response.data?.choices?.[0]?.message?.content || "";
    } catch (err) {
      console.error("OpenRouter API call failed:", err.message);
      throw err;
    }
  }

  throw new Error("No valid API keys configured in .env (provide GEMINI_API_KEY or OPENROUTERDEEPSEEK).");
}
