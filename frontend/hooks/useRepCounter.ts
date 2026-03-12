import { useEffect, useRef, useState } from "react";
import type { Pose2D } from "../pose/types";
import { evaluateSquatForm } from "../pose/rules";

type Phase = "top" | "descending" | "bottom" | "ascending";

interface UseRepCounterOptions {
  minHoldMsAtBottom?: number;
}

export interface RepSummary {
  repNumber: number;
  score: number;
  timestamp: number;
  errors: string[];
}

export interface UseRepCounterResult {
  repCount: number;
  lastRep: RepSummary | null;
  currentPhase: Phase;
  currentScore: number;
  jointStates: ReturnType<typeof evaluateSquatForm>["jointStates"];
}

export function useRepCounter(
  pose: Pose2D | null,
  options: UseRepCounterOptions = {}
): UseRepCounterResult {
  const [repCount, setRepCount] = useState(0);
  const [lastRep, setLastRep] = useState<RepSummary | null>(null);
  const [currentPhase, setCurrentPhase] = useState<Phase>("top");
  const [currentScore, setCurrentScore] = useState(0);
  const [jointStates, setJointStates] = useState<
    ReturnType<typeof evaluateSquatForm>["jointStates"]
  >({} as any);

  const bottomEnteredAtRef = useRef<number | null>(null);
  const lastDepthStateRef = useRef<"top" | "middle" | "bottom">("top");

  const minHoldMsAtBottom = options.minHoldMsAtBottom ?? 150;

  useEffect(() => {
    if (!pose) return;

    const evaluation = evaluateSquatForm(pose);
    setCurrentScore(evaluation.score);
    setJointStates(evaluation.jointStates);

    const now = performance.now();
    const prevDepth = lastDepthStateRef.current;
    const depth = evaluation.depthState;
    lastDepthStateRef.current = depth;

    if (currentPhase === "top") {
      if (depth === "middle" || depth === "bottom") {
        setCurrentPhase("descending");
      }
    } else if (currentPhase === "descending") {
      if (depth === "bottom") {
        setCurrentPhase("bottom");
        bottomEnteredAtRef.current = now;
      } else if (depth === "top") {
        setCurrentPhase("top");
      }
    } else if (currentPhase === "bottom") {
      if (depth === "bottom" && bottomEnteredAtRef.current != null) {
        const heldFor = now - bottomEnteredAtRef.current;
        if (heldFor >= minHoldMsAtBottom) {
          setCurrentPhase("ascending");
        }
      } else if (depth === "middle") {
        setCurrentPhase("ascending");
      } else if (depth === "top") {
        setCurrentPhase("top");
      }
    } else if (currentPhase === "ascending") {
      if (depth === "top" && prevDepth !== "top") {
        setRepCount(prev => {
          const nextCount = prev + 1;
          setLastRep({
            repNumber: nextCount,
            score: evaluation.score,
            timestamp: pose.timestamp,
            errors: evaluation.triggeredErrors
          });
          return nextCount;
        });
        setCurrentPhase("top");
        bottomEnteredAtRef.current = null;
      } else if (depth === "bottom") {
        setCurrentPhase("bottom");
        bottomEnteredAtRef.current = now;
      }
    }
  }, [pose, currentPhase, minHoldMsAtBottom]);

  return {
    repCount,
    lastRep,
    currentPhase,
    currentScore,
    jointStates
  };
}

