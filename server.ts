import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/podcast/tao", (req, res) => {
    const { noiDung } = req.body;
    // Mock response
    res.json({
      tap: [
        {
          tieuDe: "Tập mới",
          thoiLuong: "10:00",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        }
      ]
    });
  });

  // Chat AI
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;

      const stream = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        stream: true,
      });

      res.setHeader("Content-Type", "text/plain");

      for await (const chunk of stream) {
        res.write(chunk.choices[0]?.delta?.content || "");
      }

      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).send("Error generating chat response");
    }
  });

  // AI sửa code
  app.post("/api/fix-code", async (req, res) => {
    try {
      const { code } = req.body;

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia lập trình. Sửa code sạch, tối ưu, không giải thích dài."
          },
          {
            role: "user",
            content: `Fix và tối ưu code sau:\n${code}`
          }
        ],
      });

      res.json({
        result: completion.choices[0].message.content
      });
    } catch (error) {
      console.error("Fix code error:", error);
      res.status(500).json({ error: "Error fixing code" });
    }
  });

  // Vite middleware for development
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
