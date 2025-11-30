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
      const ws = new WebSocket("/api/realtime");

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

        // Handle audio data
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

    recorder.start(300);
  };

  return (
    <div
      style={{
        background: "radial-gradient(circle at top, #0a0f24, #02030a)",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "36px", fontWeight: "bold" }}>Ready to Practice?</h1>
      <p style={{ opacity: 0.7, marginBottom: "20px" }}>
        I'm your Pro90D AI Speech Coach. We'll use neuroscience-based techniques to transform your speech.
      </p>

      {error && (
        <div
          style={{
            background: "#7a1f2d",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {!connected ? (
        <button
          onClick={() => {
            startSession();
            sendAudio();
          }}
          style={{
            padding: "14px 30px",
            borderRadius: "50px",
            fontSize: "18px",
            background: "#4a4ce0",
            border: "none",
            cursor: "pointer",
            color: "white",
          }}
        >
          🎤 Start Live Session
        </button>
      ) : (
        <button
          onClick={stopSession}
          style={{
            padding: "14px 30px",
            borderRadius: "50px",
            fontSize: "18px",
            background: "#e04a4a",
            border: "none",
            cursor: "pointer",
            color: "white",
          }}
        >
          ⏹ Stop Session
        </button>
      )}

      <div style={{ marginTop: "40px", textAlign: "left", maxWidth: "600px", marginInline: "auto" }}>
        <h2>Transcript</h2>
        <div
          style={{
            background: "#0e1530",
            padding: "20px",
            borderRadius: "10px",
            whiteSpace: "pre-wrap",
            height: "300px",
            overflowY: "scroll",
          }}
        >
          {transcript || "Your speech will appear here..."}
        </div>
      </div>
    </div>
  );
}
