import { GoogleAIRealtime } from "@google/generative-ai/server";

export const config = {
  runtime: "nodejs18.x",
};

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  if (req.headers.upgrade !== "websocket") {
    return res.status(400).send("Expected WebSocket");
  }

  const { socket, response } = res.socket.server.ws(req);

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
      console.error("Client message error", e);
    }
  });

  session.on("response.output_text.delta", (text) => {
    socket.send(JSON.stringify({ type: "text", text }));
  });

  session.on("response.completed", () => {
    socket.send(JSON.stringify({ type: "done" }));
  });

  session.on("error", (err) => {
    socket.send(JSON.stringify({ type: "error", error: err.message }));
  });

  return response;
}
