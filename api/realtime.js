// api/realtime.js
import { GoogleAIRealtime } from "@google/generative-ai/server";

// Tell Vercel this is a Node.js (not Edge) function
export const config = {
  runtime: "nodejs",
};

export default async function handler(request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      { status: 500 }
    );
  }

  // WebSocket upgrade check
  const upgradeHeader = request.headers.get("upgrade");
  if (upgradeHeader !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 400 });
  }

  // Create the WebSocket pair
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

  // Browser → Gemini
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

  // Gemini → Browser
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
