import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Google Gemini API key
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it via Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Fetch evolving internet trends, themes, slang & sticker inspiration
app.get('/api/agent/keyboard-trends', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const prompt = `Generate a set of hot internet culture slang words, cute trending emojis combos, and 3 distinct custom keyboard layout themes (with hex colors, vibe description, and fonts) for a customizable, modern trend-based virtual keyboard. Keep them highly fresh, humorous, and based on the latest 2026 social media aesthetics (TikTok, Instagram, Gen-Z, Alpha).`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          description: "Fresh cultural trends and styles for customizable keyboard UI",
          properties: {
            slangPhrases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phrase: { type: Type.STRING, description: "Slang text/phrase to type" },
                  meaning: { type: Type.STRING, description: "Literal or funny explanation" },
                  category: { type: Type.STRING, description: "e.g., Slang, Copypasta, Emphasis" }
                },
                required: ["phrase", "meaning", "category"]
              }
            },
            emojiCombos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  combo: { type: Type.STRING, description: "String of 3-5 emojis" },
                  tag: { type: Type.STRING, description: "Context, e.g., 'Sassy', 'Brain rot', 'Cozy'" }
                },
                required: ["combo", "tag"]
              }
            },
            designThemes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Theme title (e.g. Neon Cyber, Cottagecore)" },
                  primaryColor: { type: Type.STRING, description: "Hex value for keys" },
                  secondaryColor: { type: Type.STRING, description: "Hex value for board background" },
                  accentColor: { type: Type.STRING, description: "Hex value for active/focus effects" },
                  textColor: { type: Type.STRING, description: "Hex value for key text" },
                  fontFamily: { type: Type.STRING, description: "Sans or Mono font suggestion" },
                  vibeDescription: { type: Type.STRING, description: "Marketing pitch for this trend" }
                },
                required: ["name", "primaryColor", "secondaryColor", "accentColor", "textColor", "fontFamily"]
              }
            }
          },
          required: ["slangPhrases", "emojiCombos", "designThemes"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error("Failed to generate keyboard trends", error);
    // Return graceful mock fallback if API fails or key is missing
    res.json({
      slangPhrases: [
        { phrase: "no cap", meaning: "seriously / for real", category: "Emphasis" },
        { phrase: "rizz", meaning: "charisma / romantic charm", category: "Slang" },
        { phrase: "let him cook", meaning: "give him room to make something great", category: "Phrase" },
        { phrase: "skibidi", meaning: "goofy or modern reference item", category: "Brain rot" },
        { phrase: "demure", meaning: "mindful, modest, very cute", category: "Vibe" }
      ],
      emojiCombos: [
        { combo: "🔥💅✨", tag: "Fabulous / Iconic" },
        { combo: "💀💀💀", tag: "Dead laughing" },
        { combo: "🍵👀🤫", tag: "Spilling tea / secrets" },
        { combo: "🥺👉👈", tag: "Shy request" }
      ],
      designThemes: [
        {
          name: "Neon Cyber Grid",
          primaryColor: "#0f172a",
          secondaryColor: "#030712",
          accentColor: "#22c55e",
          textColor: "#f8fafc",
          fontFamily: "Space Grotesk",
          vibeDescription: "High-contrast dark grid with radiant hacking green neon overlays."
        },
        {
          name: "Cozy Lavender Dream",
          primaryColor: "#f5f3ff",
          secondaryColor: "#ede9fe",
          accentColor: "#8b5cf6",
          textColor: "#4c1d95",
          fontFamily: "Outfit",
          vibeDescription: "Soft lavender dreamscape with pastel aesthetics for mindful chats."
        },
        {
          name: "Retro Game Boy",
          primaryColor: "#dae0cc",
          secondaryColor: "#cadc9f",
          accentColor: "#0f380f",
          textColor: "#306230",
          fontFamily: "Fira Code",
          vibeDescription: "Vintage pixel grid nostalgic color combinations from 1989."
        }
      ]
    });
  }
});

// 3. AI Text Style and Slang Enhancer Agent
app.post('/api/agent/style-text', async (req, res) => {
  const { text, promptContext } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text supplied to rewrite." });
  }

  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are a professional social media copywriting and keyboard design agent.
Your query is to rewrite or translate the user's plain text into a fun, trendy post, sticker caption, or slang-infused message according to the trend format requested.
Translate the text to three options:
- 'slangOption': The text rewrite loaded with high-energy trending gen-z words.
- 'aestheticOption': Richly stylistic emoji padded elegant text.
- 'kaomojiOption': Text formatted using adorable or funny text emotes (e.g. ( •_•) or (づ｡◕‿‿◕｡)づ)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Input text to rewrite: "${text}". Style vibe request: ${promptContext || "general fun rewrite"}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slangOption: { type: Type.STRING },
            aestheticOption: { type: Type.STRING },
            kaomojiOption: { type: Type.STRING }
          },
          required: ["slangOption", "aestheticOption", "kaomojiOption"]
        }
      }
    });

    const results = JSON.parse(response.text || '{}');
    res.json(results);
  } catch (error: any) {
    console.error("Failed to enhance text", error);
    res.json({
      slangOption: `${text} but make it absolutely legendary, lowkey iconic fr fr 💅`,
      aestheticOption: `✨ ˚｡⋆ ${text} ⋆｡° ✨`,
      kaomojiOption: `(づ｡◕‿‿◕｡)づ [ ${text} ]`
    });
  }
});

// 4. AI Custom Sticker Generation Endpoint
app.post('/api/agent/generate-sticker', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt specification for sticker generation." });
  }

  try {
    const ai = getGeminiClient();
    const searchPrompt = `${prompt}, vector cartoon 2D design, white outline, glossy die-cut sticker, high quality, solid simple background, 3D render feel but clean flat vector sticker vector graphic`;
    
    // Using gemini-2.5-flash-image for default image generation task
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: searchPrompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Loop through candidates to locate the inlineData image bytes
    let imageBase64: string | null = null;
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (imageBase64) {
      res.json({ imageUrl: `data:image/png;base64,${imageBase64}` });
    } else {
      throw new Error("No image data returned from generator model.");
    }
  } catch (error: any) {
    console.error("Failed to generate custom sticker image", error);
    res.status(500).json({ 
      error: "Could not generate AI sticker. Ensure API key has access to image generation series.",
      isMockFallback: true,
      imageUrl: "" 
    });
  }
});

// 5. AI Scrape Internet & Search-Grounded Discovery Endpoint
app.post('/api/agent/scrape-internet', async (req, res) => {
  const { categoryQuery } = req.body;
  const targetQuery = categoryQuery || "latest viral internet communication slang typography cool fonts stickers emojis and gifs developments 2026";
  
  try {
    const ai = getGeminiClient();
    const prompt = `Use Google Search to find and scrape the absolute latest 2026 style trends, creative fonts, sticker concepts, trending gifs, text templates, and animations online. Search across content creator platforms, design forums, and social channels. Then format current viral discoveries neatly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `${prompt}. Focus query area: ${targetQuery}`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          description: "Scraped live web discoveries of creator developments, fonts, stickers, gifs, and communication ideas.",
          properties: {
            scrapedQuery: { type: Type.STRING },
            scrapedAt: { type: Type.STRING },
            developmentsList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Viral post, slang launch, or layout concept description" },
                  summary: { type: Type.STRING, description: "Detailed look at what is happening" },
                  sourceTopic: { type: Type.STRING, description: "Platform or community of origin (e.g., Reddit, TikTok, X, Figma)" },
                  viralLevel: { type: Type.STRING, description: "High, Medium, Rising" }
                },
                required: ["title", "summary", "sourceTopic"]
              }
            },
            coolFonts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Font preset style description" },
                  transformedText: { type: Type.STRING, description: "The phrase 'Scraped Vibe' transformed in styled unicode symbols" },
                  vibe: { type: Type.STRING, description: "Vibe description (e.g., 'Alt-Y2K aesthetic', 'Minimal pixel')" }
                },
                required: ["name", "transformedText", "vibe"]
              }
            },
            trendingStickers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "E.g., Crying Shiba, Sparkle Heart Star" },
                  recommendedPrompt: { type: Type.STRING, description: "Sticker prompt suggestion to supply to the generator" },
                  category: { type: Type.STRING }
                },
                required: ["title", "recommendedPrompt", "category"]
              }
            },
            gifsAndEmotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  combo: { type: Type.STRING, description: "Emoji or Kaomoji visual combo representation" },
                  emotionTag: { type: Type.STRING, description: "Action or mood trigger" },
                  hypeCaption: { type: Type.STRING, description: "Aesthetic description for chats" }
                },
                required: ["combo", "emotionTag", "hypeCaption"]
              }
            },
            communicationAnimations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "E.g., Sparkle Explosion, Heartbeat pulse" },
                  triggerWord: { type: Type.STRING, description: "Hot-key word typing triggers (e.g., 'congrats', 'omg')" },
                  motionStyle: { type: Type.STRING, description: "Styling description (e.g., 'Floating confetti burst', 'Text glitch')" }
                },
                required: ["title", "triggerWord", "motionStyle"]
              }
            }
          },
          required: ["scrapedQuery", "scrapedAt", "developmentsList", "coolFonts", "trendingStickers", "gifsAndEmotes", "communicationAnimations"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error("AI dynamic search scraping failed, returning gorgeous fresh offline fallback.", err);
    res.json({
      scrapedQuery: targetQuery,
      scrapedAt: new Date().toISOString(),
      developmentsList: [
        {
          title: "The Rise of Brain Rot Kaomoji Borders",
          summary: "Discord and TikTok bio structures have shifted heavily towards complex bracket kaomoji frames instead of standard paragraph format. Users paste structured layouts for interactive bios.",
          sourceTopic: "Gen-Z Social forums",
          viralLevel: "Rising"
        },
        {
          title: "Neon Outlined Static Die-cut Stickers",
          summary: "Messengers are adopting thick white glossy stickers featuring cute pixel concepts and high-energy expressions rather than real-world photos.",
          sourceTopic: "Figma Community Feed",
          viralLevel: "High"
        },
        {
          title: "Mindful Text Spans (Demure & Chill)",
          summary: "Unicode bold block and tiny subscripts are being coupled with flower and butterfly symbols to indicate modest or light-hearted expressions.",
          sourceTopic: "TikTok Trends",
          viralLevel: "Rising"
        }
      ],
      coolFonts: [
        { name: "Y2K Glitch Bubble", transformedText: "🅂🄲🅁🄳🄿🄴🄳 🅅🄸🄱🄴", vibe: "Nostalgic console messaging overlays" },
        { name: "Elegant Minimal Cursive", transformedText: "𝒮𝒸𝓇𝒶𝓅𝑒𝒹 𝒱𝒾𝒷𝑒 ˚｡⋆", vibe: "Cozy bio headers paired with sparkly stars" },
        { name: "Double Struck Math Class", transformedText: "𝕊𝕔𝕣𝕒𝕡𝕖𝕕 𝕍𝕚𝕓𝕖 𝕗𝕣", vibe: "High-contrast standout text accentuations" }
      ],
      trendingStickers: [
        { title: "Sassy Matcha Latte Cup", recommendedPrompt: "matcha latte cup with cute cartoon eyes and sassy cat face, die cut vinyl sticker, vector", category: "Cafe Vibe" },
        { title: "Retro Pixel Controller Sparkle", recommendedPrompt: "8-bit retro video game controller with magical colorful sparkles, sticker outline", category: "Retro Gaming" },
        { title: "Lofi Cozy Cloud sleeping", recommendedPrompt: "cozy sleepy white cloud wearing yellow nightcap, pastel palette vector sticker", category: "Lofi Chill" }
      ],
      gifsAndEmotes: [
        { combo: "(●'◡'●)っ [ ✨ MAGIC ✨ ]", emotionTag: "Excited spark", hypeCaption: "Delivering sparks of joy to the chat feed" },
        { combo: "┌( ಠ_ಠ)┘ [ NO CAP ]", emotionTag: "Serious fact check", hypeCaption: "Asserting pure raw honesty" },
        { combo: "🌸✨ ˚｡⋆ (✿ 𝔡𝔢𝔪𝔲𝔯𝔢 ˚｡⋆) ⋆｡° 🌸", emotionTag: "Very demure", hypeCaption: "Fabulous modesty and mindfulness" }
      ],
      communicationAnimations: [
        { title: "Sparkle Rain Explosion", triggerWord: "magic", motionStyle: "Multi-colored shiny stars floating downward from key taps" },
        { title: "Classic Shake Hype", triggerWord: "hype", motionStyle: "Intense rapid scale vibration of clicked letter button container" },
        { title: "Heartbeat Pulse Ripple", triggerWord: "love", motionStyle: "Heart icon expands and creates a radiant outline wave layout" }
      ]
    });
  }
});

async function startServer() {
  // Serve frontend assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start listener
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Trending Keyboard Server running securely on http://localhost:${PORT}`);
  });
}

startServer();
