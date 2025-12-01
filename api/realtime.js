// api/realtime.js
import { GoogleAIRealtime } from "@google/generative-ai/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      { status: 500 }
    );
  }

  // Create WebSocketPair (Edge Runtime API)
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];

  server.accept();

  // Gemini Realtime Connection
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

  // Browser --> Gemini
  server.addEventListener("message", async (event) => {
    try {
      const msg = JSON.parse(event.data);

      if (msg.type === "client_audio") {
        // Edge runtime CANNOT use Buffer.from()
        const audioBytes = Uint8Array.from(atob(msg.data), (c) =>
          c.charCodeAt(0)
        );
        await session.sendAudio(audioBytes);
      }
    } catch (err) {
      console.error("Client message error:", err);
    }
  });

  // Gemini --> Browser
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
