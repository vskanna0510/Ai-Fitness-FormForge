"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useRef, useEffect } from "react";
import { useWebcamStream } from "../../hooks/useWebcamStream";
import { usePoseDetection } from "../../hooks/usePoseDetection";
import { useRepCounter } from "../../hooks/useRepCounter";
import { useVoiceCoaching } from "../../hooks/useVoiceCoaching";
import { MOVENET_SKELETON } from "../../pose/skeletonLayout";
import type { Pose2D, Keypoint2D } from "../../pose/types";
import type { JointState } from "../../pose/rules";

const MIN_CONFIDENCE = 0.3;

export function WebcamWithOverlay() {
  const { videoRef, isReady, error } = useWebcamStream({
    width: 1280,
    height: 720,
    facingMode: "user"
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { pose, fps } = usePoseDetection(videoRef, { targetFps: 30 });
  const { repCount, lastRep, currentPhase, currentScore, jointStates } =
    useRepCounter(pose);

  useVoiceCoaching(pose);

  const repControls = useAnimationControls();

  useEffect(() => {
    if (!lastRep) return;
    void repControls.start({
      scale: [1, 1.2, 1],
      transition: { duration: 0.25 }
    });
  }, [lastRep, repControls]);

  useEffect(() => {
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    if (!videoEl || !canvasEl) return;

    const resize = () => {
      const { videoWidth, videoHeight } = videoEl;
      if (!videoWidth || !videoHeight) return;
      canvasEl.width = videoWidth;
      canvasEl.height = videoHeight;
    };

    if (videoEl.readyState >= 2) {
      resize();
    } else {
      videoEl.onloadedmetadata = resize;
    }

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [videoRef]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const videoEl = videoRef.current;
    if (!canvasEl || !videoEl) return;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    if (!pose) return;

    drawSkeleton(ctx, pose, jointStates);
  }, [pose, videoRef, jointStates]);

  return (
    <div className="relative w-full max-w-5xl aspect-video rounded-3xl glass-panel hud-shadow overflow-hidden">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <motion.div
        className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/45 px-4 py-1.5 text-xs text-neutral-300 backdrop-blur-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {error ? (
          <span className="text-red-400">{error}</span>
        ) : (
          <>
            <span className="text-neutral-400">Pose</span>
            <span className="font-semibold text-neutral-100">{fps} FPS</span>
            <span className="h-3 w-px bg-neutral-700" />
            <span className="text-neutral-400">Phase</span>
            <span className="font-semibold capitalize text-neutral-100">
              {currentPhase}
            </span>
            <span className="h-3 w-px bg-neutral-700" />
            <span className="text-neutral-400">Form</span>
            <span className="font-semibold text-accent-blue">
              {Math.round(currentScore)}
            </span>
          </>
        )}
      </motion.div>

      <motion.div
        className="pointer-events-none absolute top-6 left-6 flex flex-col items-start gap-2 rounded-2xl bg-black/40 px-4 py-3 text-xs text-neutral-300 backdrop-blur-md"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Reps
        </span>
        <motion.span
          className="text-3xl font-semibold text-white"
          animate={repControls}
        >
          {repCount}
        </motion.span>
        {lastRep && (
          <span className="text-[11px] text-neutral-400">
            Last rep:{" "}
            <span className="text-accent-blue">
              {Math.round(lastRep.score)} / 100
            </span>
          </span>
        )}
      </motion.div>

      {!isReady && !error && (
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="space-y-3 text-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-accent-blue/70 mx-auto" />
            <p className="text-sm text-neutral-300">
              Initializing camera and pose model&hellip;
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function colorForState(state: JointState | undefined): {
  joint: string;
  line: string;
} {
  switch (state) {
    case "good":
      return {
        joint: "#22c55e",
        line: "#22c55e"
      };
    case "warning":
      return {
        joint: "#eab308",
        line: "#eab308"
      };
    case "error":
      return {
        joint: "#ef4444",
        line: "#ef4444"
      };
    default:
      return {
        joint: "#38BDF8",
        line: "#3B82F6"
      };
  }
}

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  pose: Pose2D,
  jointStates: Record<string, JointState>
) {
  const keypoints = pose.keypoints.filter(
    (kp: Keypoint2D) => kp.score >= MIN_CONFIDENCE
  );

  ctx.save();
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const [aName, bName] of MOVENET_SKELETON) {
    const a = keypoints.find(k => k.name === aName);
    const b = keypoints.find(k => k.name === bName);
    if (!a || !b) continue;

    const stateA = jointStates[a.name];
    const stateB = jointStates[b.name];
    const color = colorForState(stateA || stateB);

    ctx.strokeStyle = color.line;
    ctx.globalAlpha = stateA === "error" || stateB === "error" ? 1 : 0.9;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  for (const kp of keypoints) {
    const radius = 6;
    const state = jointStates[kp.name];
    const color = colorForState(state);

    const glowGradient = ctx.createRadialGradient(
      kp.x,
      kp.y,
      0,
      kp.x,
      kp.y,
      radius * 3
    );
    glowGradient.addColorStop(0, `${color.joint}e6`);
    glowGradient.addColorStop(1, "rgba(15,23,42,0)");

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, radius * 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#020617";
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = color.joint;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

