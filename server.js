// server.js — Express server + Gemini Realtime WebSocket proxy

import express from "express";
import { WebSocketServer } from "ws";
import { GoogleAIRealtime } from "@google/generative-ai-realtime"; // ✅ FIXED

const app = express();
const port = process.env.PORT || 3000;

// Create Express server
const server = app.listen(port, () =>
  console.log("Server running on port", port)
);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// --- Gemini Realtime WebSocket Bridge ---
wss.on("connection", async (socket) => {
  console.log("Client connected");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    socket.send(JSON.stringify({ error: "Missing GEMINI_API_KEY" }));
    socket.close();
    return;
  }

  // Create realtime client
  const client = new GoogleAIRealtime({
    apiKey: apiKey,
  });

  // Create a realtime session
  const session = client.connect({
    model: "models/gemini-2.0-flash-exp",
    sessionConfig: {
      turnDetection: { type: "server_vad" },
      modalities: ["text", "audio"], // optional
      inputModality: "audio",
      outputModality: "text",
    },
  });

  // Receive audio chunks from browser client
  socket.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "client_audio") {
        // Send raw PCM/WAV/OPUS audio to Gemini
        await session.sendAudio(Buffer.from(msg.data, "base64"));
      }
    } catch (err) {
      console.error("Message error:", err);
    }
  });

  // Handle text deltas
  session.on("response.output_text.delta", (text) => {
    socket.send(JSON.stringify({ type: "text", text }));
  });

  // Finished response
  session.on("response.completed", () => {
    socket.send(JSON.stringify({ type: "done" }));
  });

  // Gemini error handling
  session.on("error", (err) => {
    console.error("Gemini error:", err);
    socket.send(JSON.stringify({ type: "error", error: err.message }));
  });

  // Client disconnect cleanup
  socket.on("close", () => {
    console.log("Client disconnected");
    session.close();
  });
});

// Basic route
app.get("/", (req, res) => {
  res.send("Pro90D AI Speech Coach server is running.");
});
