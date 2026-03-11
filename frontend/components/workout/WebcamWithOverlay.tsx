"use client";

import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { useWebcamStream } from "../../hooks/useWebcamStream";
import { usePoseDetection } from "../../hooks/usePoseDetection";
import { MOVENET_SKELETON } from "../../pose/skeletonLayout";
import type { Pose2D, Keypoint2D } from "../../pose/types";

const MIN_CONFIDENCE = 0.3;

export function WebcamWithOverlay() {
  const { videoRef, isReady, error } = useWebcamStream({
    width: 1280,
    height: 720,
    facingMode: "user"
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { pose, fps } = usePoseDetection(videoRef, { targetFps: 30 });

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

    drawSkeleton(ctx, pose);
  }, [pose, videoRef]);

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
        className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/40 px-4 py-1.5 text-xs text-neutral-300 backdrop-blur-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {error ? (
          <span className="text-red-400">{error}</span>
        ) : (
          <span>Pose engine · {fps} FPS</span>
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

function drawSkeleton(ctx: CanvasRenderingContext2D, pose: Pose2D) {
  const keypoints = pose.keypoints.filter(
    (kp: Keypoint2D) => kp.score >= MIN_CONFIDENCE
  );

  ctx.save();
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Connections
  for (const [aName, bName] of MOVENET_SKELETON) {
    const a = keypoints.find(k => k.name === aName);
    const b = keypoints.find(k => k.name === bName);
    if (!a || !b) continue;

    const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    gradient.addColorStop(0, "rgba(59,130,246,0.85)");
    gradient.addColorStop(1, "rgba(236,72,153,0.85)");

    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // Joints
  for (const kp of keypoints) {
    const radius = 6;

    const glowGradient = ctx.createRadialGradient(
      kp.x,
      kp.y,
      0,
      kp.x,
      kp.y,
      radius * 3
    );
    glowGradient.addColorStop(0, "rgba(59,130,246,0.9)");
    glowGradient.addColorStop(1, "rgba(59,130,246,0)");

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, radius * 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0F172A";
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

