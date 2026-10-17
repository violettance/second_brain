import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Network } from 'lucide-react';
import { PublicSiteLayout } from './PublicSiteLayout';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for capturing your first ideas',
    features: [
      'Daily notes & reflections',
      'Short-term memory (30-day auto-archive)',
      'Long-term memory storage',
      'Basic project management',
      'Voice recording & transcription',
      'AI-powered tagging system',
      'Interactive knowledge graph',
      'Limited mermaid diagram generation',
      'Analytics dashboard',
      'Export capabilities'
    ],
    buttonText: 'Start for free',
    popular: false
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'For polymaths building their second brain',
    features: [
      'Everything in Free',
      'Connection discovery',
      'Pattern recognition & trends',
      'Daily insights for short-term notes',
      'Deep AI analysis of your permanent knowledge base',
      'Advanced analytics with AI-powered insights',
      'Mermaid diagram generation',
      'Offline mode + sync',
      'Feature request priority',
      'Theme choices'
    ],
    buttonText: 'Contact us for Pro',
    popular: true
  }
];

const questions = [
  {
    question: 'How does the 30-day evaluation work?',
    answer: "Your ideas start in short-term memory where they're automatically archived after 30 days. During this time, you can decide which ideas deserve to move to your long-term memory for permanent storage.",
  },
  {
    question: 'What makes this different from other note-taking apps?',
    answer: 'Second Brain focuses on connection discovery. Our AI finds hidden relationships between your ideas, creating a knowledge graph that helps you see patterns and insights you might have missed.',
  },
  {
    question: 'What happens to my knowledge graph if I cancel?',
    answer: 'Your data remains accessible for 30 days after cancellation. You can export all your notes and connections before the end of this period to preserve your second brain.',
  },
];

export const PricingPage: React.FC = () => (
  <>
      <Helmet>
        <title>Pricing - Second Brain | Choose Your Plan</title>
        <meta name="description" content="Choose the perfect Second Brain plan for your needs. Free tier available with AI-powered knowledge management, or upgrade to Pro for unlimited features and advanced AI capabilities." />
        <meta name="keywords" content="second brain pricing, knowledge management pricing, AI productivity tools, personal knowledge management cost" />
        <link rel="canonical" href="https://second-brain-pkm.vercel.app/our-pricing" />
        <meta property="og:title" content="Pricing - Second Brain | Choose Your Plan" />
        <meta property="og:description" content="Choose the perfect Second Brain plan for your needs. Free tier available with AI-powered knowledge management, or upgrade to Pro for unlimited features and advanced AI capabilities." />
        <meta property="og:url" content="https://second-brain-pkm.vercel.app/our-pricing" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://second-brain-pkm.vercel.app/dashboard.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing - Second Brain | Choose Your Plan" />
        <meta name="twitter:description" content="Choose the perfect Second Brain plan for your needs. Free tier available with AI-powered knowledge management, or upgrade to Pro for unlimited features and advanced AI capabilities." />
        <meta name="twitter:image" content="https://second-brain-pkm.vercel.app/dashboard.png" />

        {/* JSON-LD: Product with AggregateOffer for pricing */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'Second Brain',
            description:
              'AI-powered personal knowledge management system to capture, organize, and connect your thoughts seamlessly.',
            image: ['https://second-brain-pkm.vercel.app/dashboard.png'],
            brand: {
              '@type': 'Brand',
              name: 'Second Brain'
            },
            url: 'https://second-brain-pkm.vercel.app/our-pricing',
            offers: {
              '@type': 'AggregateOffer',
              lowPrice: '0',
              highPrice: '9',
              priceCurrency: 'USD',
              offerCount: '2',
              offers: [
                {
                  '@type': 'Offer',
                  name: 'Free',
                  price: '0',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  url: 'https://second-brain-pkm.vercel.app/our-pricing'
                },
                {
                  '@type': 'Offer',
                  name: 'Pro',
                  price: '9',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  url: 'https://second-brain-pkm.vercel.app/our-pricing'
                }
              ]
            }
          })}
        </script>
      </Helmet>
    <PublicSiteLayout>
      <section aria-labelledby="pricing-heading" className="mx-auto max-w-7xl px-4 pb-12 pt-7 lg:px-8 lg:pb-16">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to Second Brain
        </Link>
        <div className="mb-10 grid items-end gap-5 lg:grid-cols-copy lg:gap-12">
          <h1 id="pricing-heading" className="font-display text-5xl font-bold tracking-tight lg:text-6xl">Start free.<br />Keep growing.</h1>
          <p className="max-w-public-copy text-lg leading-relaxed text-muted">
            A place for your daily thoughts. A way to see the bigger picture. Choose how you want to build your second brain.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {plans.map(plan => {
            const Icon = plan.popular ? Network : BookOpen;
            return (
              <article key={plan.name} aria-labelledby={`plan-${plan.name}`} className="flex min-w-0 flex-col overflow-hidden rounded-xl border-2 border-ink bg-surface shadow-md">
                <div className={`border-b-2 border-ink p-6 lg:p-8 ${plan.popular ? 'bg-brand-primary-soft' : 'bg-brand-secondary-soft'}`}>
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 id={`plan-${plan.name}`} className="font-display text-2xl font-bold">{plan.name}</h2>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-ink bg-surface">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-display text-6xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-sm font-medium text-muted-strong">{plan.period}</span>
                  </div>
                  <p className="mt-4 text-sm text-muted-strong">{plan.description}</p>
                </div>
                <div className="flex flex-1 flex-col p-6 lg:p-8">
                  {plan.popular ? (
                    <a href="mailto:productora.analytics@gmail.com?subject=Second%20Brain%20Pro" className="sb-action inline-flex items-center justify-center gap-3 px-5 py-3 text-base">
                      {plan.buttonText} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link to="/auth" className="sb-action sb-action-secondary inline-flex items-center justify-center gap-3 px-5 py-3 text-base">
                      {plan.buttonText} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  )}
                  <h3 className="mb-4 mt-8 text-sm font-semibold">{plan.popular ? 'Go further with Pro' : 'Everything you need to begin'}</h3>
                  <ul className="space-y-3">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-muted-strong">
                        <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-7 text-center text-sm text-muted">Questions about a plan? <a href="mailto:productora.analytics@gmail.com" className="font-semibold text-ink underline underline-offset-4">Let's talk.</a></p>
      </section>

      <section aria-labelledby="pricing-questions" className="border-t-2 border-ink bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-copy lg:gap-12 lg:px-8 lg:py-16">
          <div>
            <h2 id="pricing-questions" className="max-w-public-copy font-display text-3xl font-bold tracking-tight lg:text-4xl">A few things<br />to know.</h2>
            <p className="mt-4 max-w-public-copy text-sm text-muted">A closer look at how your notes, connections, and plan work together.</p>
          </div>
          <div className="min-w-0 border-t-2 border-ink">
            {questions.map(({ question, answer }, index) => (
              <details key={question} open={index === 0} className="sb-accordion border-b-2 border-ink">
                <summary className="flex cursor-pointer items-start justify-between gap-5 py-5 font-display text-lg font-bold">
                  {question}<ChevronDown aria-hidden="true" className="sb-disclosure-icon mt-1 h-5 w-5 shrink-0" />
                </summary>
                <p className="pb-6 text-sm leading-reading text-muted-strong">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  </>
);

export default PricingPage;
