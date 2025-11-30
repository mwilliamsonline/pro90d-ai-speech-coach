import { useState, useRef, useEffect } from "react";

export default function App() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // FIXED LINE
  const [sessionActive, setSessionActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [transcript, setTranscript] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!apiKey) {
      setErrorMessage("API Key not found in environment.");
    }
  }, [apiKey]);

  const startLiveSession = async () => {
    if (!apiKey) {
      setErrorMessage("API Key not found in environment.");
      return;
    }

    setErrorMessage("");
    setSessionActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];

        await sendAudioToGemini(audioBlob);
      };

      mediaRecorderRef.current.start(1000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not access microphone.");
    }
  };

  const stopSession = () => {
    setSessionActive(false);
    mediaRecorderRef.current?.stop();
  };

  const sendAudioToGemini = async (audioBlob: Blob) => {
    if (!apiKey) return;

    const base64Audio = await blobToBase64(audioBlob);

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" +
          apiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      data: base64Audio,
                      mimeType: "audio/webm",
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        setTranscript((prev) => prev + "\n" + data.candidates[0].content.parts[0].text);
      } else {
        console.log("No usable response from Gemini:", data);
      }
    } catch (error) {
      console.error("Gemini API error:", error);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
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

      {errorMessage && (
        <div
          style={{
            background: "#7a1f2d",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {errorMessage}
        </div>
      )}

      {!sessionActive ? (
        <button
          onClick={startLiveSession}
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
          }}
        >
          {transcript || "Your speech will appear here..."}
        </div>
      </div>

      <audio ref={audioRef} autoPlay />
    </div>
  );
}
