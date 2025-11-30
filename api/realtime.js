// File: api/realtime.js
// Vercel Edge WebSocket proxy for Google Gemini Realtime API

import { GoogleAIRealtime } from "@google/generative-ai/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), {
      status: 500,
    });
  }

  // Create WebSocket pair (edge runtime)
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];

  // Accept connection
  server.accept();

  // Connect to Gemini Realtime
  const realtime = new GoogleAIRealtime({
    apiKey,
    model: "models/gemini-2.0-flash-exp",
  });

  const session = realtime.connect({
    sessionConfig: {
      turnDetection: { type: "server_vad" },
      modalities: ["text"],
      inputModality: "audio",
      outputModality: "text",
    },
  });

  // === Forward messages from browser → Gemini ===
  server.addEventListener("message", async (event) => {
    try {
      const message = JSON.parse(event.data);

      if (message.type === "client_audio") {
        await session.sendAudio(Buffer.from(message.data, "base64"));
      }
    } catch (err) {
      console.error("Client message error:", err);
    }
  });

  // === Forward responses Gemini → browser ===
  session.on("response.output_text.delta", (text) => {
    server.send(JSON.stringify({ type: "text", text }));
  });

  session.on("response.completed", () => {
    server.send(JSON.stringify({ type: "done" }));
  });

  session.on("error", (err) => {
    console.error("Gemini error:", err);
    server.send(JSON.stringify({ type: "error", error: err.message }));
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
