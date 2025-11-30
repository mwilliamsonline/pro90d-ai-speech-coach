// File: /api/realtime.ts
// Vercel Edge Function for Gemini Realtime Audio

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIRealtime } from "@google/generative-ai/server";
import { WebSocket } from "ws";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Missing GEMINI_API_KEY in environment variables.",
        }),
        { status: 500 }
      );
    }

    // Create Gemini Realtime Session
    const realtime = new GoogleAIRealtime({
      apiKey,
      model: "gaps-realtime-preview-llama", // Or another realtime model
    });

    // Connect to the Gemini Realtime WebSocket server
    const connection = await realtime.connect();

    // Upgrade the client connection to a WebSocket
    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    // Forward messages between browser <-> gemini
    server.addEventListener("message", (event) => {
      connection.send(event.data);
    });

    // Forward messages from Gemini → browser
    for await (const msg of connection) {
      server.send(typeof msg === "string" ? msg : JSON.stringify(msg));
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  } catch (err) {
    console.error("Realtime handler error:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to start realtime session.",
        details: err?.message,
      }),
      { status: 500 }
    );
  }
}

