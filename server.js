import * as GoogleServer from "@google/generative-ai/server";
console.log("AVAILABLE EXPORTS:", GoogleServer);


import express from "express";
import { WebSocketServer } from "ws";
import { GoogleAIRealtimeClient } from "@google/generative-ai/server";

const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log("Server running on port", port);
});

const wss = new WebSocketServer({ server });

wss.on("connection", async (socket) => {
  console.log("Client connected");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    socket.send(JSON.stringify({ error: "Missing GEMINI_API_KEY" }));
    socket.close();
    return;
  }

  const client = new GoogleAIRealtimeClient({ apiKey });

  const session = client.startRealtimeConnection({
    model: "models/gemini-2.0-flash-exp",
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
    } catch (err) {
      console.error("Message error:", err);
    }
  });

  session.on("response.output_text.delta", (text) => {
    socket.send(JSON.stringify({ type: "text", text }));
  });

  session.on("response.completed", () => {
    socket.send(JSON.stringify({ type: "done" }));
  });

  session.on("error", (err) => {
    console.error("Gemini error:", err);
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
