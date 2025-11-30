
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  isAudio?: boolean;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
}

export enum AppState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

export interface TranscriptItem {
  speaker: 'user' | 'model';
  text: string;
  isComplete: boolean;
}

export type VoiceName = 'Puck' | 'Charon' | 'Fenrir';
export type SpeechSpeed = 'slow' | 'normal' | 'fast';

export type VisualMode = 
  | 'idle' 
  | 'breathing' 
  | 'free_flow_overview' 
  | 'free_flow_1' 
  | 'free_flow_2' 
  | 'free_flow_3' 
  | 'free_flow_4' 
  | 'science_neuroplasticity' 
  | 'science_myelination'
  | 'science_habit_formation'
  | 'proactive_overview'
  | 'proactive_extending'
  | 'proactive_blending'
  | 'proactive_inflecting'
  | 'proactive_articulating'
  | 'structure_vic'
  | 'structure_ric'
  | 'modeling_bridge'
  | 'comparison_old_new';
