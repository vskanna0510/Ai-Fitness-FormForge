import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-6">
      <section className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
          FormForge
        </h1>
        <p className="max-w-xl mx-auto text-neutral-400 text-lg">
          An AI-native, browser-based coach that watches your form, counts your reps, and keeps you honest.
        </p>
        <Link
          href="/workout"
          className="inline-flex items-center rounded-full bg-accent-blue px-8 py-3 text-base font-medium shadow-glass transition hover:bg-accent-orange"
        >
          Launch Workout HUD
        </Link>
      </section>
    </main>
  );
}

