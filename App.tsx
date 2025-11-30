
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { EXERCISES, SYSTEM_INSTRUCTION_TEMPLATE } from './constants';
import { float32ToBase64PCM, decodeAudioData } from './utils/audio';
import { AppState, TranscriptItem, VoiceName, VisualMode } from './types';
import BreathingVisualizer from './components/BreathingVisualizer';
import FreeFlowVisualizer from './components/FreeFlowVisualizer';
import ScienceVisualizer from './components/ScienceVisualizer';
import ProactiveVisualizer from './components/ProactiveVisualizer';
import ModelingVisualizer from './components/ModelingVisualizer';
import StructureVisualizer from './components/StructureVisualizer';
import ComparisonVisualizer from './components/ComparisonVisualizer';

const App: React.FC = () => {
  // Application State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Fixed Settings for Pro90D Coach Persona
  const selectedVoice: VoiceName = 'Charon';
  const [visualMode, setVisualMode] = useState<VisualMode>('idle');

  // Refs for Audio Contexts and State
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Live API Session
  const sessionRef = useRef<Promise<any> | null>(null); 
  
  // Audio Playback Queue
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Auto-scroll for transcripts
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, []);

  const handleServerMessage = async (message: LiveServerMessage) => {
     const { serverContent } = message;

     // 1. Handle Audio Output
     if (serverContent?.modelTurn) {
         for (const part of serverContent.modelTurn.parts) {
             if (part.inlineData?.data && audioContextRef.current) {
                 const audioCtx = audioContextRef.current;
                 const audioBuffer = await decodeAudioData(part.inlineData.data, audioCtx, 24000);
                 
                 nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
                 
                 const source = audioCtx.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(audioCtx.destination);
                 source.start(nextStartTimeRef.current);
                 
                 nextStartTimeRef.current += audioBuffer.duration;
                 scheduledSourcesRef.current.push(source);

                 source.onended = () => {
                    const index = scheduledSourcesRef.current.indexOf(source);
                    if (index > -1) scheduledSourcesRef.current.splice(index, 1);
                 };
             }
         }
     }

     // 2. Handle Interruption
     if (serverContent?.interrupted) {
         scheduledSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
         scheduledSourcesRef.current = [];
         if (audioContextRef.current) nextStartTimeRef.current = audioContextRef.current.currentTime;
     }

     // 3. Handle Transcriptions & Keyword Detection for Visuals
     if (serverContent?.outputTranscription) {
         const text = serverContent.outputTranscription.text;
         if (text) {
            updateTranscripts(text, 'model');
            detectVisualTriggers(text);
         }
     }

     if (serverContent?.inputTranscription) {
         const text = serverContent.inputTranscription.text;
         if (text) {
             updateTranscripts(text, 'user');
         }
     }

     if (serverContent?.turnComplete) {
         setTranscripts(prev => {
             if (prev.length === 0) return prev;
             const newArr = [...prev];
             newArr[newArr.length - 1].isComplete = true;
             return newArr;
         });
     }
  };

  const updateTranscripts = (text: string, speaker: 'user' | 'model') => {
    setTranscripts(prev => {
        const last = prev[prev.length - 1];
        if (last && last.speaker === speaker && !last.isComplete) {
            const newArr = [...prev];
            newArr[prev.length - 1] = { ...last, text: last.text + text };
            return newArr;
        } else {
            // Close previous turn if switching speaker
            const newArr = [...prev];
            if (newArr.length > 0) {
                 newArr[newArr.length - 1].isComplete = true;
            }
            return [...newArr, { speaker, text, isComplete: false }];
        }
    });
  };

  const detectVisualTriggers = (text: string) => {
      const lowerText = text.toLowerCase();
      
      // Breathing
      if (lowerText.includes("breathing") || lowerText.includes("7x7") || lowerText.includes("7 by 7") || lowerText.includes("seven by seven")) {
          setVisualMode('breathing');
          return;
      }

      // Science
      if (lowerText.includes("neuroplasticity") || lowerText.includes("neurons")) { setVisualMode('science_neuroplasticity'); return; }
      if (lowerText.includes("myelin")) { setVisualMode('science_myelination'); return; }
      if (lowerText.includes("habit") || lowerText.includes("pathway") || lowerText.includes("highway")) { setVisualMode('science_habit_formation'); return; }

      // Comparison
      if (lowerText.includes("old style") || lowerText.includes("new style") || lowerText.includes("old speech") || lowerText.includes("comparison")) { setVisualMode('comparison_old_new'); return; }

      // Modeling
      if (lowerText.includes("model") || lowerText.includes("bridge") || lowerText.includes("leapfrog")) { setVisualMode('modeling_bridge'); return; }

      // Free Flow Phases
      if (lowerText.includes("phase 1")) { setVisualMode('free_flow_1'); return; }
      if (lowerText.includes("phase 2")) { setVisualMode('free_flow_2'); return; }
      if (lowerText.includes("phase 3")) { setVisualMode('free_flow_3'); return; }
      if (lowerText.includes("phase 4")) { setVisualMode('free_flow_4'); return; }
      if (lowerText.includes("free flow") || lowerText.includes("free-flow")) { setVisualMode('free_flow_overview'); return; }

      // Proactive Skills
      if (lowerText.includes("extending")) { setVisualMode('proactive_extending'); return; }
      if (lowerText.includes("blending")) { setVisualMode('proactive_blending'); return; }
      if (lowerText.includes("inflecting") || lowerText.includes("inflection")) { setVisualMode('proactive_inflecting'); return; }
      if (lowerText.includes("articulating") || lowerText.includes("articulation")) { setVisualMode('proactive_articulating'); return; }
      if (lowerText.includes("proactive")) { setVisualMode('proactive_overview'); return; }

      // Structure (VIC/RIC)
      if (lowerText.includes("vic") || lowerText.includes("value") && lowerText.includes("impact")) { setVisualMode('structure_vic'); return; }
      if (lowerText.includes("ric") || lowerText.includes("relevant")) { setVisualMode('structure_ric'); return; }
  };

  const connectSession = async () => {
      const apiKey = process.env.API_KEY;
      if(!apiKey) {
          setErrorMsg("API Key not found in environment.");
          setAppState(AppState.ERROR);
          return;
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      nextStartTimeRef.current = audioContextRef.current.currentTime;

      setAppState(AppState.CONNECTING);
      setErrorMsg(null);
      setTranscripts([]);
      setVisualMode('idle');

      const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION_TEMPLATE }] },
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
            inputAudioTranscription: {}, 
            outputAudioTranscription: {}, 
          },
          callbacks: {
              onopen: async () => {
                  setAppState(AppState.CONNECTED);
                  await startMicrophone(sessionPromise);
              },
              onmessage: (msg) => handleServerMessage(msg),
              onclose: () => {
                  setAppState(AppState.DISCONNECTED);
                  stopMicrophone();
              },
              onerror: (e) => {
                  console.error(e);
                  setAppState(AppState.ERROR);
                  setErrorMsg("Connection Error. Check API Key or Network.");
                  stopMicrophone();
              }
          }
      });
      sessionRef.current = sessionPromise;
  };

  const startMicrophone = async (sessionPromise: Promise<any>) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      if (!inputAudioContextRef.current) return;

      sourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

      processorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setCurrentVolume(Math.min(1, rms * 5));

        const base64PCM = float32ToBase64PCM(inputData);
        
        sessionPromise.then((session) => {
          session.sendRealtimeInput({
            media: {
              mimeType: "audio/pcm;rate=16000",
              data: base64PCM
            }
          });
        });
      };

      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(inputAudioContextRef.current.destination);

    } catch (err) {
      console.error("Microphone Error", err);
      setErrorMsg("Could not access microphone. Please allow permissions.");
      setAppState(AppState.ERROR);
    }
  };

  const stopMicrophone = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    setCurrentVolume(0);
  };

  const disconnectSession = async () => {
    stopMicrophone();
    scheduledSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    scheduledSourcesRef.current = [];

    if (sessionRef.current) {
      try {
          const session = await sessionRef.current;
          session.close();
      } catch (e) {
          console.log("Session close error", e);
      }
      sessionRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }

    setAppState(AppState.IDLE);
    setVisualMode('idle');
  };

  const closeVisuals = () => {
      setVisualMode('idle');
  };

  // Helper to get display title for visualizer container
  const getVisualTitle = () => {
      if (visualMode.startsWith('free_flow')) return "Free-Flow Speaking";
      if (visualMode === 'breathing') return "Breathing Exercise";
      if (visualMode.startsWith('science')) return "Neuroscience";
      if (visualMode.startsWith('proactive')) return "Proactive Skills";
      if (visualMode.startsWith('structure')) return "Presentation Structure";
      if (visualMode.startsWith('modeling')) return "Modeling";
      if (visualMode.startsWith('comparison')) return "Mindset Shift";
      return "Session Active";
  };

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100 font-sans">
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
           <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl mix-blend-screen filter"></div>
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600 rounded-full blur-3xl mix-blend-screen filter"></div>
        </div>

        <header className="z-10 p-6 flex justify-between items-center border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span className="text-xl font-bold text-white">P</span>
                </div>
                <div>
                    <h1 className="text-lg font-semibold tracking-tight">Pro90D AI Speech Coach</h1>
                    <p className="text-xs text-slate-400 font-medium">Smooth Speech System • Live</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {appState === AppState.CONNECTED && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-emerald-400 font-medium">Live Session</span>
                    </div>
                )}
            </div>
        </header>

        <main className="flex-1 z-10 flex flex-col items-center justify-center w-full max-w-6xl mx-auto p-4 gap-6 relative">
            
            {appState === AppState.IDLE || appState === AppState.DISCONNECTED || appState === AppState.ERROR ? (
                <div className="text-center space-y-8 max-w-lg animate-fade-in w-full">
                    <div className="space-y-4">
                         <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Practice?</h2>
                         <p className="text-slate-400 text-lg">
                             I'm your Pro90D AI Speech Coach. We'll use neuroscience-based techniques to transform your speech.
                         </p>
                    </div>

                    {appState === AppState.ERROR && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {errorMsg || "An error occurred."}
                        </div>
                    )}

                    <button 
                        onClick={connectSession}
                        className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-slate-900 w-full md:w-auto"
                    >
                        <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                        <span className="relative flex items-center gap-3 text-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                            </svg>
                            Start Live Session
                        </span>
                    </button>
                </div>
            ) : (
                <div className="w-full flex flex-col h-full gap-4">
                    
                    {/* Top Area: Visuals + Transcript */}
                    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                        
                        {/* Visualizer Panel */}
                        <div className="flex-[2] relative bg-slate-800/30 rounded-3xl border border-slate-700/50 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
                            
                            {visualMode === 'idle' ? (
                                <div className="relative flex items-center justify-center w-full h-full">
                                    <div className="text-center space-y-6 z-10 px-4">
                                         <div className="inline-block p-4 bg-indigo-600 rounded-full shadow-xl animate-bounce">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                                                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                                                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                                            </svg>
                                         </div>
                                         <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Session Active</h3>
                                            <p className="text-slate-400 text-lg animate-pulse">Say <span className="text-emerald-400 font-bold">"Hello"</span> to start!</p>
                                         </div>
                                    </div>

                                    {/* Background Pulse Effect */}
                                    <div 
                                        className="absolute w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl transition-all duration-75"
                                        style={{ transform: `scale(${1 + currentVolume * 2})`, opacity: 0.5 + currentVolume }}
                                    ></div>
                                </div>
                            ) : (
                                <div className="w-full h-full p-6 flex items-center justify-center relative">
                                    <div className="absolute top-4 left-6 text-xs font-medium text-indigo-400 uppercase tracking-widest z-20 bg-slate-900/80 px-3 py-1 rounded-full border border-indigo-500/30">
                                        {getVisualTitle()}
                                    </div>
                                    
                                    <button 
                                        onClick={closeVisuals}
                                        className="absolute top-4 right-4 px-3 py-1 bg-slate-900/50 hover:bg-slate-900 text-xs text-slate-300 rounded-full transition-colors flex items-center gap-1 z-20 backdrop-blur-sm border border-slate-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                                        </svg>
                                        Close
                                    </button>
                                    
                                    {visualMode === 'breathing' && <BreathingVisualizer />}
                                    
                                    {visualMode.startsWith('free_flow') && (
                                        <FreeFlowVisualizer 
                                            activePhase={
                                                visualMode === 'free_flow_1' ? 1 : 
                                                visualMode === 'free_flow_2' ? 2 : 
                                                visualMode === 'free_flow_3' ? 3 : 
                                                visualMode === 'free_flow_4' ? 4 : 0
                                            } 
                                        />
                                    )}
                                    
                                    {(visualMode === 'science_neuroplasticity' || visualMode === 'science_myelination' || visualMode === 'science_habit_formation') && (
                                        <ScienceVisualizer mode={visualMode === 'science_neuroplasticity' ? 'neuroplasticity' : visualMode === 'science_myelination' ? 'myelination' : 'habit_formation'} />
                                    )}

                                    {visualMode.startsWith('proactive') && (
                                        <ProactiveVisualizer mode={visualMode as any} />
                                    )}

                                    {visualMode.startsWith('structure') && (
                                        <StructureVisualizer mode={visualMode as any} />
                                    )}

                                    {visualMode === 'modeling_bridge' && (
                                        <ModelingVisualizer />
                                    )}

                                    {visualMode === 'comparison_old_new' && (
                                        <ComparisonVisualizer />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Transcript Panel */}
                        <div className="flex-1 bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50 flex flex-col shadow-inner min-h-[200px] max-h-[400px] md:max-h-none">
                            <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
                                </svg>
                                Transcript
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-2">
                                {transcripts.length === 0 && (
                                    <p className="text-slate-500 text-sm italic text-center mt-10">No conversation yet.</p>
                                )}
                                {transcripts.map((t, i) => (
                                    <div key={i} className={`flex ${t.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                            t.speaker === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-br-none' 
                                            : 'bg-slate-700 text-slate-200 rounded-bl-none'
                                        }`}>
                                            {t.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={transcriptEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Area: Suggestion Cards (Prompting User to Ask) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {EXERCISES.map(ex => (
                            <div
                                key={ex.id}
                                className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl flex flex-col items-center justify-center gap-2 h-24 text-center"
                            >
                                <div className="text-xl">{ex.icon}</div>
                                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{ex.title}</div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex justify-center pb-2">
                         <button 
                            onClick={disconnectSession}
                            className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                            </svg>
                            End Session
                        </button>
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default App;
