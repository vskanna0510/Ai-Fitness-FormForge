import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-converter";
import * as tf from "@tensorflow/tfjs-core";
import type { Pose2D, Keypoint2D } from "./types";

let detector: posedetection.PoseDetector | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

async function createDetector() {
  await tf.setBackend("webgl");
  await tf.ready();

  detector = await posedetection.createDetector(
    posedetection.SupportedModels.MoveNet,
    {
      modelType: posedetection.movenet.modelType.THUNDER,
      enableSmoothing: true
    }
  );
}

export async function ensureMoveNetLoaded() {
  if (detector) return;
  if (isInitializing && initPromise) {
    await initPromise;
    return;
  }
  isInitializing = true;
  initPromise = createDetector();
  await initPromise;
  isInitializing = false;
}

export async function estimatePose(video: HTMLVideoElement): Promise<Pose2D | null> {
  await ensureMoveNetLoaded();
  if (!detector) return null;

  const poses = await detector.estimatePoses(video, {
    maxPoses: 1,
    flipHorizontal: true
  });

  const pose = poses[0];
  if (!pose || !pose.keypoints) return null;

  const keypoints: Keypoint2D[] = pose.keypoints.map(kp => ({
    name: kp.name as Keypoint2D["name"],
    x: kp.x,
    y: kp.y,
    score: kp.score ?? 0
  }));

  return {
    keypoints,
    score: pose.score ?? 0,
    timestamp: performance.now()
  };
}

