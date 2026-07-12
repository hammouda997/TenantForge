'use client';

export function HeroBackground() {
  return (
    <div
      data-hero-bg
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(100vh,920px)] overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-slate-950" />

      <div
        data-aurora-ray
        className="absolute left-1/2 top-0 h-[70%] w-[min(140vw,960px)] -translate-x-1/2 opacity-80"
        style={{
          background:
            'conic-gradient(from 205deg at 50% 0%, transparent 38%, rgba(59,130,246,0.22) 46%, rgba(139,92,246,0.16) 52%, transparent 62%)',
        }}
      />

      <div data-aurora-beam="primary" className="landing-aurora-beam landing-aurora-beam-primary" />
      <div data-aurora-beam="secondary" className="landing-aurora-beam landing-aurora-beam-secondary" />
      <div data-aurora-beam="accent" className="landing-aurora-beam landing-aurora-beam-accent" />

      <div
        data-aurora-glow
        className="absolute left-1/2 top-[8%] h-64 w-[min(90vw,720px)] -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl"
      />

      <div className="landing-aurora-noise absolute inset-0 opacity-[0.04] mix-blend-overlay" />

      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent" />
    </div>
  );
}
