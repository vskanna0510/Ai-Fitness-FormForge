import type { KeypointName, Pose2D } from "./types";

export type JointConnection = [KeypointName, KeypointName];

export const MOVENET_SKELETON: JointConnection[] = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
  ["nose", "left_eye"],
  ["nose", "right_eye"],
  ["left_eye", "left_ear"],
  ["right_eye", "right_ear"]
];

export function getKeypoint(pose: Pose2D, name: KeypointName) {
  return pose.keypoints.find(kp => kp.name === name);
}

