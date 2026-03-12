import { useEffect } from "react";
import type { Pose2D } from "../pose/types";
import { evaluateSquatForm } from "../pose/rules";
import { speakCue, type CoachingCue } from "../lib/voice/voiceCoach";

const ERROR_TO_CUE: CoachingCue[] = [
  {
    id: "spine-neutral",
    message: "Keep your back straighter.",
    category: "spine",
    minCooldownMs: 6000
  },
  {
    id: "knee-depth",
    message: "Sit a bit deeper into your squat.",
    category: "depth",
    minCooldownMs: 6000
  },
  {
    id: "hip-depth",
    message: "Drive your hips back and down.",
    category: "depth",
    minCooldownMs: 6000
  }
];

export function useVoiceCoaching(pose: Pose2D | null) {
  useEffect(() => {
    if (!pose) return;

    const evaluation = evaluateSquatForm(pose);
    if (evaluation.triggeredErrors.length === 0) return;

    const error = evaluation.triggeredErrors[0];
    const cue = ERROR_TO_CUE.find(c => c.message === error);
    if (!cue) return;

    speakCue(cue, { volume: 0.9, rate: 1 });
  }, [pose]);
}

