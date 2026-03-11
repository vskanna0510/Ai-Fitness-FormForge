export type KeypointName =
  | "nose"
  | "left_eye"
  | "right_eye"
  | "left_ear"
  | "right_ear"
  | "left_shoulder"
  | "right_shoulder"
  | "left_elbow"
  | "right_elbow"
  | "left_wrist"
  | "right_wrist"
  | "left_hip"
  | "right_hip"
  | "left_knee"
  | "right_knee"
  | "left_ankle"
  | "right_ankle";

export interface Keypoint2D {
  name: KeypointName;
  x: number;
  y: number;
  score: number;
}

export interface Pose2D {
  keypoints: Keypoint2D[];
  score: number;
  timestamp: number;
}

