export function extractJsonBlock(text) {
  if (!text || typeof text !== "string") return null;
  
  const pattern = /```json([\s\S]*?)```/;
  const match = text.match(pattern);
  if (match) return match[1].trim();
  
  const generalPattern = /```([\s\S]*?)```/;
  const generalMatch = text.match(generalPattern);
  if (generalMatch) return generalMatch[1].trim();
  
  return text.trim();
}

export function parseLLMJson(text, fallback = {}) {
  if (!text) return fallback;
  
  // 1. Try direct parsing
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") return parsed;
  } catch (e) {
    // proceed
  }
  
  // 2. Try extracting from markdown code block
  const extracted = extractJsonBlock(text);
  if (extracted) {
    try {
      const parsed = JSON.parse(extracted);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (err) {
      // 3. Try parsing substring between first '{' and last '}' of the extracted text
      const firstBrace = extracted.indexOf("{");
      const lastBrace = extracted.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          const parsed = JSON.parse(extracted.substring(firstBrace, lastBrace + 1));
          if (parsed && typeof parsed === "object") return parsed;
        } catch (braceErr) {
          // proceed
        }
      }
    }
  }
  
  // 4. Try parsing substring between first '{' and last '}' of the raw text
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const parsed = JSON.parse(text.substring(firstBrace, lastBrace + 1));
      if (parsed && typeof parsed === "object") return parsed;
    } catch (braceErr) {
      // proceed
    }
  }
  
  console.error("Failed to parse LLM JSON response. Raw text:", text);
  return fallback;
}
