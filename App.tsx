import { useState, useEffect, useRef } from "react";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Connect to backend
  const startSession = () => {
  try {
    setError("");

    // FIXED LINE — REQUIRED FOR VERCEL
    const ws = new WebSocket(`wss://${window.location.host}/api/realtime`);

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "start" }));
    };


      ws.onmessage = async (evt) => {
        const msg = evt.data;

        // Handle text transcripts
        if (typeof msg === "string") {
          try {
            const data = JSON.parse(msg);

            if (data.text) {
              setTranscript((t) => t + "\n" + data.text);
            }

            return;
          } catch {
            // Not JSON → treat as text
            setTranscript((t) => t + "\n" + msg);
          }
        }

        // Handle audio data from backend
        if (msg instanceof Blob) {
          const arrayBuffer = await msg.arrayBuffer();

          if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContext();
          }

          const audioBuffer = await audioCtxRef.current.decodeAudioData(
            arrayBuffer
          );

          const source = audioCtxRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtxRef.current.destination);
          source.start();
        }
      };

      ws.onerror = () => setError("WebSocket error");
      ws.onclose = () => setConnected(false);

      wsRef.current = ws;
    } catch (e) {
      console.error(e);
      setError("Could not start session.");
    }
  };

  const stopSession = () => {
    wsRef.current?.close();
    setConnected(false);
  };

  // Send mic audio to backend
  const sendAudio = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      wsRef.current?.send(e.data);
    };

    reco
