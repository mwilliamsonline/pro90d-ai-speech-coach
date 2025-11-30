// File: /api/realtime.js
// Vercel Edge-compatible WebSocket proxy for Gemini Realtime

import { GoogleAIRealtime } from "@google/generative-ai/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  // 1. Check API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      { status: 500 }
    );
  }

  // 2. Create WebSocketPair (Edge Runtime)
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];

  server.accept();

  // 3. Create Gemini Realtime session
  const realtime = new GoogleAIRealtime({
    apiKey
