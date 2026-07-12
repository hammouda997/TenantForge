'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Copy,
  Github,
  Layers,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@tenantforge/ui';
import { HeroBackground } from './hero-background';
import {
  FEATURES,
  FLOATING_ICONS,
  HERO_STATS,
  STACK,
  STEPS,
} from './landing-data';
import { useLandingAnimations } from './use-landing-animations';
import { TechStackIcon } from './tech-stack-icons';

const PREVIEW_METRICS = [
  { label: 'Organizations', value: '2', trend: '+1 demo' },
  { label: 'Active projects', value: '4', trend: 'Live data' },
  { label: 'MRR pipeline', value: '$2.4k', trend: 'Mock billing' },
  { label: 'Audit events', value: '128', trend: 'Last 30 days' },
] as const;

const CODE_LINES = [
  { text: 'pnpm docker:up && pnpm db:seed && pnpm dev', tone: 'command' as const },
  { text: '', tone: 'blank' as const },
  { text: '# demo@tenantforge.dev / Password123!', tone: 'comment' as const },
  { text: '# → Multi-tenant dashboard in under 5 minutes', tone: 'comment' as const },
];

const QUICK_START = CODE_LINES.map((line) => line.text).join('\n');

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  useLandingAnimations(rootRef);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(QUICK_START);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={rootRef}
      className="landing-page relative min-h-screen overflow-x-clip bg-slate-950 text-white"
    >
      <div
        data-hero-shell
        className="relative isolate min-h-[min(100vh,920px)] overflow-x-clip overflow-y-hidden"
      >
        <HeroBackground />

        <header
          data-nav
          className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">TenantForge</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            {['Features', 'Architecture', 'Stack'].map((item) => (
              <a
                key={item}
                data-nav-link
                href={`#${item.toLowerCase()}`}
                className="transition-colors hover:text-white"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex gap-3">
            <Link href="/login" data-nav-link>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign in
              </Button>
            </Link>
            <Link href="/register" data-nav-link>
              <Button className="bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-violet-500">
                Get started
              </Button>
            </Link>
          </div>
        </header>

        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-8 text-center">
          {FLOATING_ICONS.map(({ icon: Icon, className, color }, index) => (
            <div
              key={index}
              data-floating-icon
              data-floating-color={color}
              className={`pointer-events-none absolute hidden lg:block ${className}`}
              style={{ animationDelay: `${index * -0.9}s` }}
            >
              <Icon
                data-floating-icon-svg
                className="h-8 w-8 md:h-10 md:w-10"
                strokeWidth={1.25}
                style={{ color: `rgba(${color}, 0.55)` }}
              />
            </div>
          ))}

          <div
            data-hero-badge
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            Open-source · MIT · Production-grade SaaS reference
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
              v0.1
            </span>
          </div>

          <h1
            data-hero-title
            className="mx-auto max-w-5xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Multi-tenant SaaS platform{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
              built for scale
            </span>
          </h1>

          <div
            data-hero-highlight
            className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
          />

          <p
            data-hero-subtitle
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl"
          >
            Reference architecture with org-based RBAC, Stripe billing, audit logs, and
            real-time notifications — NestJS, Next.js, and TypeScript end to end.
          </p>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {HERO_STATS.map(({ label, value, suffix, icon: Icon }) => (
              <div
                key={label}
                data-hero-stat
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 backdrop-blur-sm"
              >
                <Icon className="mx-auto mb-2 h-5 w-5 text-blue-400" />
                <p className="text-2xl font-bold tabular-nums">
                  <span data-stat-value={value}>0</span>
                  {suffix}
                </p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div
            data-hero-cta
            className="mt-12 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 px-8 shadow-xl shadow-blue-600/25 hover:from-blue-500 hover:to-violet-500"
              >
                Start building
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="https://github.com/hammouda997/tenantforge"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/20 bg-white/5 text-white backdrop-blur hover:bg-white/10"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            </a>
          </div>
        </section>
      </div>

      <main className="relative z-20 bg-slate-950">
        <section className="relative mx-auto max-w-5xl px-6 pb-24">
          <div
            data-preview-glow
            className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-cyan-500/20 opacity-40 blur-2xl"
          />
          <div
            data-preview
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-blue-500/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-green-400/80" />
              <Terminal className="ml-2 h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs text-slate-500">tenantforge — dashboard</span>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
              {PREVIEW_METRICS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/5 bg-slate-800/60 px-4 py-5 text-left transition-colors hover:border-blue-400/20"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400/80">
                    <CheckCircle2 className="h-3 w-3" />
                    {stat.trend}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div data-section-title className="mb-10 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-blue-400">
              Platform capabilities
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Everything you need to ship SaaS
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Battle-tested patterns extracted from production multi-tenant systems — auth,
              billing, audit, and collaboration in one cohesive stack.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ title, desc, icon: Icon, accent, iconTone }) => (
              <article
                key={title}
                data-feature
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative">
                  <div
                    data-feature-icon
                    className={`landing-feature-icon mb-4 inline-flex rounded-xl p-3 ring-1 shadow-lg transition-all duration-300 ${iconTone.bg} ${iconTone.text} ${iconTone.ring} ${iconTone.hoverBg} ${iconTone.hoverText} ${iconTone.hoverRing} ${iconTone.glow}`}
                  >
                    <Icon data-feature-icon-svg className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="architecture" className="relative border-y border-white/5 bg-slate-900/40 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div data-section-title className="mb-10 text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">From clone to demo in minutes</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-400">
                Three steps to a running multi-tenant environment with seeded data and a live dashboard.
              </p>
            </div>

            <div className="relative grid gap-5 md:grid-cols-3 md:gap-6">
              <div
                aria-hidden
                className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-10 hidden h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent md:block"
              />
              {STEPS.map(({ step, title, desc, icon: Icon, iconTone }) => (
                <div
                  key={step}
                  data-step
                  className="group relative rounded-2xl border border-white/10 bg-slate-950 p-7 shadow-sm transition-colors duration-300 hover:border-violet-400/30"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span
                      data-step-number
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15 text-sm font-bold text-violet-300 ring-1 ring-violet-400/20 transition-all duration-300 group-hover:bg-violet-500/25 group-hover:text-violet-200 group-hover:ring-violet-400/40"
                    >
                      {step}
                    </span>
                    <div
                      data-step-icon
                      className={`landing-step-icon rounded-xl p-2.5 ring-1 shadow-md transition-all duration-300 ${iconTone.bg} ${iconTone.text} ${iconTone.ring} ${iconTone.hoverBg} ${iconTone.hoverText} ${iconTone.hoverRing} ${iconTone.glow}`}
                    >
                      <Icon data-step-icon-svg className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
                </div>
              ))}
            </div>

            <div
              data-code-block
              className="relative mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  <Code2 className="ml-2 h-4 w-4 text-slate-500" />
                  <span className="text-xs text-slate-500">Quick start</span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="overflow-x-auto p-6 font-mono text-sm leading-7">
                <code>
                  {CODE_LINES.map((line, index) => {
                    if (line.tone === 'blank') {
                      return <span key={index} className="block h-7" />;
                    }
                    const className =
                      line.tone === 'command'
                        ? 'text-emerald-300'
                        : 'text-slate-500';
                    return (
                      <span key={index} className={`block ${className}`}>
                        {line.text}
                      </span>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>
        </section>

        <section id="stack" className="py-20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p data-section-title className="text-sm font-medium uppercase tracking-widest text-slate-500">
              Built with
            </p>
            <div
              data-marquee
              className="relative mt-8 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
            >
              <div data-marquee-track className="flex w-max gap-4 will-change-transform">
                {[...STACK, ...STACK].map((item, index) => (
                  <span
                    key={`${item.id}-${index}`}
                    data-marquee-item
                    data-marquee-pill
                    data-stack-color={item.color}
                    className="landing-marquee-pill flex shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-slate-300"
                  >
                    <TechStackIcon
                      id={item.id}
                      color={item.color}
                      data-marquee-icon
                      className="h-4 w-4 transition-[filter,opacity] duration-300"
                    />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-32">
          <div
            data-footer-cta
            className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/25 via-violet-600/15 to-slate-900 p-12 text-center sm:p-16"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
            <Zap className="relative mx-auto h-10 w-10 text-amber-300" />
            <h2 className="relative mt-6 text-3xl font-bold sm:text-4xl">
              Ready to explore the codebase?
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-slate-300">
              Clone the repo, run Docker + pnpm dev, and demo multi-tenant auth, billing, and
              audit logs in under five minutes.
            </p>
            <div className="relative mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="gap-2 bg-white px-8 text-slate-900 hover:bg-slate-100"
                >
                  <BookOpen className="h-4 w-4" />
                  Create free account
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/10"
                >
                  Sign in to demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-20 border-t border-white/5 bg-slate-950 py-8 text-center text-sm text-slate-500">
        <p>TenantForge · MIT License · Built for engineers who ship</p>
      </footer>
    </div>
  );
}
