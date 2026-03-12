import type { KeypointName, Pose2D } from "./types";
import { angleBetween } from "./jointGeometry";

export type JointState = "good" | "warning" | "error";

export interface AngleRule {
  id: string;
  joint: "knee" | "hip" | "spine";
  side?: "left" | "right";
  minAngle?: number;
  maxAngle?: number;
  warningMargin?: number;
  errorMessage: string;
  weight: number; // 0-1
}

export interface ExerciseRuleConfig {
  id: string;
  name: string;
  type: "squat";
  rules: AngleRule[];
  depthBottomThreshold: number;
  depthTopThreshold: number;
}

export interface FormEvaluation {
  score: number; // 0-100
  jointStates: Record<KeypointName, JointState>;
  triggeredErrors: string[];
  depthState: "top" | "bottom" | "middle";
}

export const squatRuleConfig: ExerciseRuleConfig = {
  id: "bodyweight-squat",
  name: "Bodyweight Squat",
  type: "squat",
  depthBottomThreshold: 70,
  depthTopThreshold: 150,
  rules: [
    {
      id: "spine-neutral",
      joint: "spine",
      minAngle: 150,
      warningMargin: 10,
      errorMessage: "Keep your back straighter.",
      weight: 0.4
    },
    {
      id: "knee-depth",
      joint: "knee",
      side: "left",
      minAngle: 60,
      warningMargin: 10,
      errorMessage: "Sit a bit deeper into the squat.",
      weight: 0.2
    },
    {
      id: "knee-depth-right",
      joint: "knee",
      side: "right",
      minAngle: 60,
      warningMargin: 10,
      errorMessage: "Sit a bit deeper into the squat.",
      weight: 0.2
    },
    {
      id: "hip-depth",
      joint: "hip",
      minAngle: 60,
      warningMargin: 10,
      errorMessage: "Drive hips back and down.",
      weight: 0.2
    }
  ]
};

export function evaluateSquatForm(pose: Pose2D): FormEvaluation {
  const byName: Partial<Record<KeypointName, { x: number; y: number; score: number }>> =
    {};

  for (const kp of pose.keypoints) {
    byName[kp.name] = kp;
  }

  const jointStates: Record<KeypointName, JointState> = {} as Record<
    KeypointName,
    JointState
  >;
  const triggeredErrors = new Set<string>();

  let totalScore = 0;
  let totalWeight = 0;

  const leftHip = byName["left_hip"];
  const rightHip = byName["right_hip"];
  const leftKnee = byName["left_knee"];
  const rightKnee = byName["right_knee"];
  const leftAnkle = byName["left_ankle"];
  const rightAnkle = byName["right_ankle"];
  const leftShoulder = byName["left_shoulder"];
  const rightShoulder = byName["right_shoulder"];

  const midHip =
    leftHip && rightHip
      ? {
          x: (leftHip.x + rightHip.x) / 2,
          y: (leftHip.y + rightHip.y) / 2,
          score: (leftHip.score + rightHip.score) / 2
        }
      : null;

  const midShoulder =
    leftShoulder && rightShoulder
      ? {
          x: (leftShoulder.x + rightShoulder.x) / 2,
          y: (leftShoulder.y + rightShoulder.y) / 2,
          score: (leftShoulder.score + rightShoulder.score) / 2
        }
      : null;

  const leftSpineAngle =
    leftHip && leftShoulder && midHip
      ? angleBetween(leftHip, midHip, leftShoulder)
      : null;
  const rightSpineAngle =
    rightHip && rightShoulder && midHip
      ? angleBetween(rightHip, midHip, rightShoulder)
      : null;
  const spineAngle =
    leftSpineAngle && rightSpineAngle
      ? (leftSpineAngle + rightSpineAngle) / 2
      : leftSpineAngle ?? rightSpineAngle ?? null;

  const leftKneeAngle =
    leftHip && leftKnee && leftAnkle
      ? angleBetween(leftHip, leftKnee, leftAnkle)
      : null;
  const rightKneeAngle =
    rightHip && rightKnee && rightAnkle
      ? angleBetween(rightHip, rightKnee, rightAnkle)
      : null;
  const hipAngle =
    midShoulder && midHip && leftKnee
      ? angleBetween(midShoulder, midHip, leftKnee)
      : null;

  const angles = {
    spine: spineAngle,
    leftKnee: leftKneeAngle,
    rightKnee: rightKneeAngle,
    hip: hipAngle
  };

  for (const rule of squatRuleConfig.rules) {
    let angle: number | null = null;

    if (rule.joint === "spine") {
      angle = angles.spine;
    } else if (rule.joint === "knee") {
      angle = rule.side === "right" ? angles.rightKnee : angles.leftKnee;
    } else if (rule.joint === "hip") {
      angle = angles.hip;
    }

    if (angle == null) continue;

    totalWeight += rule.weight;

    let ruleScore = 1;
    let isError = false;
    let isWarning = false;

    if (rule.minAngle !== undefined) {
      if (angle < rule.minAngle) {
        ruleScore = 0;
        isError = true;
      } else if (
        rule.warningMargin !== undefined &&
        angle < rule.minAngle + rule.warningMargin
      ) {
        ruleScore = 0.6;
        isWarning = true;
      }
    }

    if (rule.maxAngle !== undefined) {
      if (angle > rule.maxAngle) {
        ruleScore = 0;
        isError = true;
      } else if (
        rule.warningMargin !== undefined &&
        angle > rule.maxAngle - rule.warningMargin
      ) {
        ruleScore = 0.6;
        isWarning = true;
      }
    }

    totalScore += ruleScore * rule.weight;

    if (isError) triggeredErrors.add(rule.errorMessage);
    else if (isWarning) triggeredErrors.add(rule.errorMessage);
  }

  const normalizedScore =
    totalWeight === 0 ? 100 : Math.round((totalScore / totalWeight) * 100);

  const setJointState = (name: KeypointName, state: JointState) => {
    const current = jointStates[name];
    if (!current) {
      jointStates[name] = state;
      return;
    }
    if (current === "good" && state !== "good") jointStates[name] = state;
    if (current === "warning" && state === "error") jointStates[name] = "error";
  };

  if (leftKneeAngle != null && leftHip && leftKnee && leftAnkle) {
    const state =
      leftKneeAngle < squatRuleConfig.depthBottomThreshold
        ? "good"
        : leftKneeAngle < squatRuleConfig.depthTopThreshold
        ? "warning"
        : "error";
    setJointState("left_hip", state);
    setJointState("left_knee", state);
    setJointState("left_ankle", state);
  }

  if (rightKneeAngle != null && rightHip && rightKnee && rightAnkle) {
    const state =
      rightKneeAngle < squatRuleConfig.depthBottomThreshold
        ? "good"
        : rightKneeAngle < squatRuleConfig.depthTopThreshold
        ? "warning"
        : "error";
    setJointState("right_hip", state);
    setJointState("right_knee", state);
    setJointState("right_ankle", state);
  }

  if (spineAngle != null && midHip && midShoulder) {
    const state =
      spineAngle >= 160 ? "good" : spineAngle >= 140 ? "warning" : "error";
    setJointState("left_hip", state);
    setJointState("right_hip", state);
    setJointState("left_shoulder", state);
    setJointState("right_shoulder", state);
  }

  let depthState: FormEvaluation["depthState"] = "middle";
  const avgKneeAngle =
    leftKneeAngle && rightKneeAngle
      ? (leftKneeAngle + rightKneeAngle) / 2
      : leftKneeAngle ?? rightKneeAngle ?? null;

  if (avgKneeAngle != null) {
    if (avgKneeAngle < squatRuleConfig.depthBottomThreshold) {
      depthState = "bottom";
    } else if (avgKneeAngle > squatRuleConfig.depthTopThreshold) {
      depthState = "top";
    } else {
      depthState = "middle";
    }
  }

  return {
    score: normalizedScore,
    jointStates,
    triggeredErrors: Array.from(triggeredErrors),
    depthState
  };
}

