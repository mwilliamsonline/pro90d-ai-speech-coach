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

  // Create WS pair (browser <-> edge)
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];
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

  // Browser → Gemini audio input
  server.addEventListener("message", async (event) => {
    try {
      let msg = event.data;

      // If client sends "start"
      if (msg === "start") {
        return;
      }

      // Audio should arrive as base64
      const data = JSON.parse(msg);

      if (data.type === "client_audio") {
        const audioBytes = Buffer.from(data.data, "base64");
        await session.sendAudio(audioBytes);
      }
    } catch (err) {
      console.error("Client message error:", err);
    }
  });

  // Gemini → Browser text streaming
  session.on("response.output_text.delta", (text) => {
    server.send(JSON.stringify({ type: "text", text }));
  });

  session.on("response.completed", () => {
    server.send(JSON.stringify({ type: "done" }));
  });

  // Error handling
  session.on("error", (err) => {
    console.error("Gemini error:", err);
    server.send(JSON.stringify({ type: "error", error: err.message }));
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
