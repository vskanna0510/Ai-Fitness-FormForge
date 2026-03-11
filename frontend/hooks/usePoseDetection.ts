import { useEffect, useRef, useState } from "react";
import { estimatePose } from "../pose/movenetClient";
import type { Pose2D } from "../pose/types";

interface UsePoseDetectionOptions {
  targetFps?: number;
}

interface UsePoseDetectionResult {
  pose: Pose2D | null;
  isModelReady: boolean;
  fps: number;
}

export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UsePoseDetectionOptions = {}
): UsePoseDetectionResult {
  const [pose, setPose] = useState<Pose2D | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [fps, setFps] = useState(0);

  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());

  const targetInterval = 1000 / (options.targetFps ?? 30);

  useEffect(() => {
    let isCancelled = false;

    async function tick() {
      if (isCancelled) return;

      const now = performance.now();
      const sinceLastFrame = now - lastFrameTimeRef.current;

      if (sinceLastFrame >= targetInterval) {
        lastFrameTimeRef.current = now;
        const videoEl = videoRef.current;

        if (videoEl && videoEl.readyState >= 2) {
          try {
            const nextPose = await estimatePose(videoEl);
            if (!isCancelled) {
              if (nextPose && !isModelReady) setIsModelReady(true);
              setPose(nextPose);
              frameCountRef.current += 1;

              const timeSinceLastFps = now - lastFpsUpdateRef.current;
              if (timeSinceLastFps >= 1000) {
                const currentFps =
                  (frameCountRef.current * 1000) / timeSinceLastFps;
                setFps(Math.round(currentFps));
                frameCountRef.current = 0;
                lastFpsUpdateRef.current = now;
              }
            }
          } catch {
            // Swallow inference errors for now; logging will be added later.
          }
        }
      }

      rafIdRef.current = window.requestAnimationFrame(tick);
    }

    rafIdRef.current = window.requestAnimationFrame(tick);

    return () => {
      isCancelled = true;
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [targetInterval, videoRef, isModelReady]);

  return { pose, isModelReady, fps };
}

