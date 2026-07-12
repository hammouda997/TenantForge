import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Boxes,
  CreditCard,
  Database,
  GitBranch,
  Lock,
  Rocket,
  ScrollText,
  Server,
  Shield,
  Users,
  Webhook,
  Zap,
} from 'lucide-react';

export interface IconTone {
  bg: string;
  text: string;
  ring: string;
  hoverBg: string;
  hoverText: string;
  hoverRing: string;
  glow: string;
}

export interface FeatureItem {
  title: string;
  desc: string;
  icon: LucideIcon;
  accent: string;
  iconTone: IconTone;
}

export interface StepItem {
  step: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  iconTone: IconTone;
}

export interface StatItem {
  label: string;
  value: number;
  suffix: string;
  icon: LucideIcon;
}

const tones = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    ring: 'ring-blue-400/15',
    hoverBg: 'group-hover:bg-blue-500/20',
    hoverText: 'group-hover:text-blue-200',
    hoverRing: 'group-hover:ring-blue-400/35',
    glow: 'group-hover:shadow-xl group-hover:shadow-blue-500/45',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-300',
    ring: 'ring-violet-400/15',
    hoverBg: 'group-hover:bg-violet-500/20',
    hoverText: 'group-hover:text-violet-200',
    hoverRing: 'group-hover:ring-violet-400/35',
    glow: 'group-hover:shadow-xl group-hover:shadow-violet-500/45',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    ring: 'ring-amber-400/15',
    hoverBg: 'group-hover:bg-amber-500/20',
    hoverText: 'group-hover:text-amber-200',
    hoverRing: 'group-hover:ring-amber-400/35',
    glow: 'group-hover:shadow-xl group-hover:shadow-amber-500/45',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    ring: 'ring-emerald-400/15',
    hoverBg: 'group-hover:bg-emerald-500/20',
    hoverText: 'group-hover:text-emerald-200',
    hoverRing: 'group-hover:ring-emerald-400/35',
    glow: 'group-hover:shadow-xl group-hover:shadow-emerald-500/45',
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-300',
    ring: 'ring-pink-400/15',
    hoverBg: 'group-hover:bg-pink-500/20',
    hoverText: 'group-hover:text-pink-200',
    hoverRing: 'group-hover:ring-pink-400/35',
    glow: 'group-hover:shadow-xl group-hover:shadow-pink-500/45',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-300',
    ring: 'ring-indigo-400/15',
    hoverBg: 'group-hover:bg-indigo-500/20',
    hoverText: 'group-hover:text-indigo-200',
    hoverRing: 'group-hover:ring-indigo-400/35',
    glow: 'group-hover:shadow-xl group-hover:shadow-indigo-500/45',
  },
  sky: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-300',
    ring: 'ring-sky-400/15',
    hoverBg: 'group-hover:bg-sky-500/20',
    hoverText: 'group-hover:text-sky-200',
    hoverRing: 'group-hover:ring-sky-400/35',
    glow: 'group-hover:shadow-xl group-hover:shadow-sky-500/45',
  },
  slate: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    ring: 'ring-slate-400/15',
    hoverBg: 'group-hover:bg-slate-500/20',
    hoverText: 'group-hover:text-slate-200',
    hoverRing: 'group-hover:ring-slate-400/35',
    glow: 'group-hover:shadow-xl group-hover:shadow-slate-400/35',
  },
} as const satisfies Record<string, IconTone>;

export const HERO_STATS: StatItem[] = [
  { label: 'Demo orgs', value: 2, suffix: '', icon: Boxes },
  { label: 'API endpoints', value: 40, suffix: '+', icon: Server },
  { label: 'Type-safe', value: 100, suffix: '%', icon: Lock },
  { label: 'Setup time', value: 5, suffix: ' min', icon: Rocket },
];

export const FEATURES: FeatureItem[] = [
  {
    title: 'Multi-tenant RBAC',
    desc: 'Org-scoped isolation with Owner, Admin, Member, and Viewer roles enforced at every layer.',
    icon: Shield,
    accent: 'from-blue-500/20 to-cyan-500/10',
    iconTone: tones.blue,
  },
  {
    title: 'Stripe Billing',
    desc: 'Checkout sessions, subscription lifecycle, webhooks, and customer portal out of the box.',
    icon: CreditCard,
    accent: 'from-violet-500/20 to-purple-500/10',
    iconTone: tones.violet,
  },
  {
    title: 'Audit Logs',
    desc: 'Immutable activity trail for auth, billing, and org mutations with actor attribution.',
    icon: ScrollText,
    accent: 'from-amber-500/20 to-orange-500/10',
    iconTone: tones.amber,
  },
  {
    title: 'Real-time Events',
    desc: 'WebSocket notifications with in-app delivery and read-state tracking.',
    icon: Bell,
    accent: 'from-emerald-500/20 to-teal-500/10',
    iconTone: tones.emerald,
  },
  {
    title: 'Projects & Tasks',
    desc: 'Collaborative workspace primitives with comments and assignee workflows.',
    icon: GitBranch,
    accent: 'from-pink-500/20 to-rose-500/10',
    iconTone: tones.pink,
  },
  {
    title: 'Member Management',
    desc: 'Invite flows, role changes, and org switching with session-aware context.',
    icon: Users,
    accent: 'from-indigo-500/20 to-blue-500/10',
    iconTone: tones.indigo,
  },
  {
    title: 'Webhook Pipeline',
    desc: 'Stripe event ingestion with idempotent handlers and structured error recovery.',
    icon: Webhook,
    accent: 'from-sky-500/20 to-blue-500/10',
    iconTone: tones.sky,
  },
  {
    title: 'Production Data Layer',
    desc: 'Prisma + PostgreSQL with migrations, seed scripts, and typed query patterns.',
    icon: Database,
    accent: 'from-slate-500/20 to-zinc-500/10',
    iconTone: tones.slate,
  },
];

export const STEPS: StepItem[] = [
  {
    step: '01',
    title: 'Clone & boot',
    desc: 'Docker Compose for Postgres and Redis, then pnpm dev across the Turborepo.',
    icon: Rocket,
    iconTone: tones.violet,
  },
  {
    step: '02',
    title: 'Seed demo data',
    desc: 'Two orgs, five users, projects, tasks, billing, and audit history in one command.',
    icon: Zap,
    iconTone: tones.amber,
  },
  {
    step: '03',
    title: 'Ship your fork',
    desc: 'Extend RBAC, add domains, or extract packages — architecture stays modular.',
    icon: GitBranch,
    iconTone: tones.emerald,
  },
];

export type StackTechId =
  | 'nestjs'
  | 'nextjs'
  | 'prisma'
  | 'postgresql'
  | 'redis'
  | 'stripe'
  | 'socketio'
  | 'docker'
  | 'turborepo'
  | 'typescript';

export interface StackItem {
  id: StackTechId;
  label: string;
  color: string;
}

export const STACK: StackItem[] = [
  { id: 'nestjs', label: 'NestJS', color: 'E0234E' },
  { id: 'nextjs', label: 'Next.js 15', color: 'FFFFFF' },
  { id: 'prisma', label: 'Prisma', color: 'FFFFFF' },
  { id: 'postgresql', label: 'PostgreSQL', color: '4169E1' },
  { id: 'redis', label: 'Redis', color: 'FF4438' },
  { id: 'stripe', label: 'Stripe', color: '635BFF' },
  { id: 'socketio', label: 'Socket.io', color: 'FFFFFF' },
  { id: 'docker', label: 'Docker', color: '2496ED' },
  { id: 'turborepo', label: 'Turborepo', color: 'FF1E56' },
  { id: 'typescript', label: 'TypeScript', color: '3178C6' },
];

export const FLOATING_ICONS = [
  { icon: Shield, className: 'left-[8%] top-[22%]', color: '59,130,246' },
  { icon: CreditCard, className: 'right-[12%] top-[18%]', color: '139,92,246' },
  { icon: Database, className: 'left-[15%] bottom-[32%]', color: '34,211,238' },
  { icon: Webhook, className: 'right-[18%] bottom-[28%]', color: '52,211,153' },
  { icon: Lock, className: 'left-[45%] top-[12%]', color: '251,191,36' },
] as const;
