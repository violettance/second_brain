import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PublicSiteLayout } from './PublicSiteLayout';
import { ArrowRight, BookOpen, Brain, Network, Mic } from 'lucide-react';

interface LandingPageProps {
  onGoToApp: () => void;
}

const features = [
  {
    icon: BookOpen,
    title: 'Catch the thought',
    description: 'Write a daily note or dictate one while it is still fresh.',
    tone: 'bg-brand-primary-soft',
  },
  {
    icon: Network,
    title: 'Follow the thread',
    description: 'See the links between notes, projects, and questions.',
    tone: 'bg-brand-secondary-soft',
  },
  {
    icon: Brain,
    title: 'Keep what matters',
    description: 'Move useful ideas into a lasting, searchable memory.',
    tone: 'bg-brand-yellow-soft',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToApp }) => {
  return (
    <>
      <Helmet>
        <title>Second Brain — Capture, connect, remember</title>
        <meta name="description" content="Capture daily thoughts, connect ideas, and keep the knowledge worth returning to." />
        <meta name="keywords" content="personal knowledge management, notes, second brain, knowledge graph" />
        <link rel="canonical" href="https://second-brain-pkm.vercel.app/" />
        <meta property="og:title" content="Second Brain — Capture, connect, remember" />
        <meta property="og:description" content="A calm, connected home for the ideas you want to keep." />
        <meta property="og:url" content="https://second-brain-pkm.vercel.app/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <PublicSiteLayout onGoToApp={onGoToApp}>
          <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 lg:grid-cols-landing lg:gap-16 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-md border-2 border-ink bg-brand-secondary-soft px-3 py-1.5 text-sm font-semibold shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-ink bg-brand-primary" />
                A workspace for curious minds
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
                Your ideas deserve to <span className="inline-block bg-brand-yellow px-2">connect.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Catch the thought, find the thread, and keep the insight. Second Brain gives your notes a place to grow into something useful.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={onGoToApp} className="sb-action inline-flex items-center justify-center gap-2 px-6 py-3 text-base">
                  Start with a note <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </button>
                <a href="/our-pricing" className="inline-flex items-center justify-center rounded-md border-2 border-ink bg-surface px-6 py-3 text-base font-semibold shadow-sm transition-transform hover:-translate-y-0.5">
                  See how it works
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted">
                <span className="inline-flex items-center gap-2"><BookOpen aria-hidden="true" className="h-4 w-4 text-brand-primary" /> Daily notes</span>
                <span className="inline-flex items-center gap-2"><Mic aria-hidden="true" className="h-4 w-4 text-brand-purple" /> Voice capture</span>
                <span className="inline-flex items-center gap-2"><Network aria-hidden="true" className="h-4 w-4 text-secondary" /> Idea links</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
              <div aria-hidden="true" className="absolute -right-3 -top-3 h-full w-full rounded-xl border-2 border-ink bg-brand-primary" />
              <div className="relative rounded-xl border-2 border-ink bg-surface p-4 shadow-lg sm:p-6">
                <div className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4">
                  <div>
                    <p className="text-sm font-medium text-muted">Your knowledge map</p>
                    <h2 className="font-display text-xl font-bold">One idea, three paths</h2>
                  </div>
                  <div className="rounded-md border-2 border-ink bg-brand-yellow p-2">
                    <Brain aria-hidden="true" className="h-5 w-5" />
                  </div>
                </div>

                <div className="relative grid min-h-64 grid-cols-2 gap-3 sm:min-h-72">
                  <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 440 260" preserveAspectRatio="none">
                    <path d="M220 130 105 55M220 130 335 55M220 130 105 205M220 130 335 205" fill="none" stroke="var(--color-ink)" strokeWidth="var(--border-width)" strokeDasharray="var(--space-2) var(--space-2)" />
                  </svg>
                  <div className="relative z-10 flex flex-col justify-center rounded-md border-2 border-ink bg-brand-primary-soft p-3 shadow-sm">
                    <span className="mb-2 text-xs font-semibold text-muted">Daily note</span>
                    <span className="font-display text-sm font-bold">A question from today</span>
                  </div>
                  <div className="relative z-10 flex flex-col justify-center rounded-md border-2 border-ink bg-brand-secondary-soft p-3 shadow-sm">
                    <span className="mb-2 text-xs font-semibold text-muted">Project</span>
                    <span className="font-display text-sm font-bold">Learning plan</span>
                  </div>
                  <div className="relative z-10 flex flex-col justify-center rounded-md border-2 border-ink bg-brand-purple-soft p-3 shadow-sm">
                    <span className="mb-2 text-xs font-semibold text-muted">Long-term memory</span>
                    <span className="font-display text-sm font-bold">A pattern worth keeping</span>
                  </div>
                  <div className="relative z-10 flex flex-col justify-center rounded-md border-2 border-ink bg-brand-yellow-soft p-3 shadow-sm">
                    <span className="mb-2 text-xs font-semibold text-muted">Next action</span>
                    <span className="font-display text-sm font-bold">Read and connect</span>
                  </div>
                  <div className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-brand-secondary shadow-sm">
                    <Network aria-hidden="true" className="h-7 w-7" />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between rounded-md border-2 border-ink bg-surface-muted px-3 py-2 text-sm">
                  <span className="font-medium">Connection found</span>
                  <span className="rounded-md border-2 border-ink bg-brand-yellow px-2 py-0.5 font-semibold">+ 3 related ideas</span>
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="border-y-2 border-ink bg-surface">
            <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
              <div className="mb-8 grid gap-4 md:grid-cols-copy md:items-end">
                <h2 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">A simple path from thought to insight.</h2>
                <p className="max-w-xl text-muted">Keep the capture lightweight. Let connections and context build over time.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {features.map(({ icon: Icon, title, description, tone }) => (
                  <article key={title} className="sb-panel p-5 lg:p-6">
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-md border-2 border-ink ${tone}`}>
                      <Icon aria-hidden="true" className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-xl font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-16">
            <div className="max-w-2xl">
              <p className="mb-2 text-sm font-semibold text-muted">Start small</p>
              <h2 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">Save one thought. See where it leads.</h2>
            </div>
            <button type="button" onClick={onGoToApp} className="sb-action inline-flex w-fit items-center gap-2 px-6 py-3 text-base">
              Open Second Brain <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </section>
      </PublicSiteLayout>
    </>
  );
};
