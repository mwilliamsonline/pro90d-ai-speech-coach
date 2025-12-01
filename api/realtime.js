import { GoogleAIRealtime } from "@google/generative-ai/server";

export default function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  // Must upgrade the connection to WebSocket
  if (req.headers.upgrade !== "websocket") {
    return res.status(400).send("Expected WebSocket upgrade");
  }

  // Upgrade to WebSocket
  const { socket, response } = res.socket.server.ws(req);

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

  // Handle messages from browser
  socket.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "client_audio") {
        await session.sendAudio(Buffer.from(msg.data, "base64"));
      }
    } catch (err) {
      console.error("Client message error:", err);
    }
  });

  // Gemini → Browser (text streaming)
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

  return response; // MUST return the WebSocket upgrade response
}
