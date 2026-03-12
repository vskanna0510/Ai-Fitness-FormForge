export type CoachingCategory =
  | "spine"
  | "depth"
  | "knees"
  | "general";

export interface CoachingCue {
  id: string;
  message: string;
  category: CoachingCategory;
  minCooldownMs: number;
}

export interface VoiceCoachOptions {
  volume?: number;
  rate?: number;
  pitch?: number;
}

const DEFAULT_OPTIONS: Required<VoiceCoachOptions> = {
  volume: 1,
  rate: 1,
  pitch: 1
};

const lastSpokenByCategory: Partial<Record<CoachingCategory, number>> = {};

export function speakCue(cue: CoachingCue, opts?: VoiceCoachOptions) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;

  const now = Date.now();
  const lastSpoken = lastSpokenByCategory[cue.category];

  if (lastSpoken && now - lastSpoken < cue.minCooldownMs) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cue.message);
  const options = { ...DEFAULT_OPTIONS, ...opts };
  utterance.volume = options.volume;
  utterance.rate = options.rate;
  utterance.pitch = options.pitch;

  window.speechSynthesis.speak(utterance);
  lastSpokenByCategory[cue.category] = now;
}

