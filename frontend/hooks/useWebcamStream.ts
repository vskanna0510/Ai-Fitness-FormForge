import { useEffect, useRef, useState } from "react";

interface UseWebcamStreamOptions {
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
}

interface UseWebcamStreamResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  isReady: boolean;
  error: string | null;
}

export function useWebcamStream(
  options: UseWebcamStreamOptions = {}
): UseWebcamStreamResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let stream: MediaStream | null = null;

    async function init() {
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            width: options.width ?? { ideal: 1280 },
            height: options.height ?? { ideal: 720 },
            frameRate: { ideal: 30 },
            facingMode: options.facingMode ?? "user"
          },
          audio: false
        };

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not supported in this browser.");
        }

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        const videoEl = videoRef.current;
        if (!videoEl) return;

        videoEl.srcObject = stream;
        videoEl.onloadedmetadata = () => {
          videoEl.play().catch(() => {
            setError("Unable to start video playback.");
          });
        };

        setIsReady(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to access webcam.";
        setError(message);
      }
    }

    void init();

    return () => {
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [options.width, options.height, options.facingMode]);

  return { videoRef, isReady, error };
}

