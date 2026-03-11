"use client";

import { motion } from "framer-motion";
import { WebcamWithOverlay } from "../../components/workout/WebcamWithOverlay";

export default function WorkoutPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background px-4 py-6 md:px-8">
      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-between px-6 py-4 text-xs text-neutral-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="font-semibold text-neutral-200">FormForge HUD</span>
        <span>Pose engine · MoveNet Thunder</span>
      </motion.header>

      <section className="flex flex-1 items-center justify-center">
        <WebcamWithOverlay />
      </section>
    </main>
  );
}

