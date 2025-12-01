// server.js — Express server + Gemini Realtime WebSocket proxy

import express from "express";
import { WebSocketServer } from "ws";
import { GoogleAIRealtime } from "@google/generative-ai/server";

const app = express();
const port = process.env.PORT || 3000;

// Create a raw HTTP server that Express can use
const server = app.listen(port, () => {
  console.log("Server running on port", port);
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// --- Gemini Realtime setup ---
wss.on("connection", async (socket) => {
  console.log("Client connected");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    socket.send(JSON.stringify({ error: "Missing GEMINI_API_KEY" }));
    socket.close();
    return;
  }

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

  socket.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "client_audio") {
        await session.sendAudio(Buffer.from(msg.data, "base64"));
      }
    } catch (e) {
      console.error(e);
    }
  });

  session.on("response.output_text.delta", (text) => {
    socket.send(JSON.stringify({ type: "text", text }));
  });

  session.on("response.completed", () => {
    socket.send(JSON.stringify({ type: "done" }));
  });

  session.on("error", (err) => {
    console.error(err);
    socket.send(JSON.stringify({ type: "error", error: err.message }));
  });

  socket.on("close", () => {
    console.log("Client disconnected");
    session.close();
  });
});

app.get("/", (req, res) => {
  res.send("Pro90D AI Speech Coach server is running.");
});
