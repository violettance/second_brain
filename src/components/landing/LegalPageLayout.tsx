import { ArrowLeft, ArrowUp, ChevronDown, FileText, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicSiteLayout } from './PublicSiteLayout';

interface LegalSection {
  title: string;
  content: string;
}

interface LegalPageLayoutProps {
  kind: 'terms' | 'privacy';
  sections: LegalSection[];
}

function PolicyText({ content }: { content: string }) {
  return (
    <div className="space-y-5 text-base leading-reading text-muted-strong">
      {content.trim().split(/\n\s*\n/).map((block, index) => {
        const lines = block.split('\n').map(line => line.trim());
        const firstBullet = lines.findIndex(line => line.startsWith('•'));
        if (firstBullet === -1) return <p key={index} className="whitespace-pre-line break-words">{block.trim()}</p>;
        return (
          <div key={index}>
            {firstBullet > 0 && <p className="mb-2 font-semibold text-ink">{lines.slice(0, firstBullet).join(' ')}</p>}
            <ul className="list-disc space-y-2 pl-5 marker:text-ink">
              {lines.slice(firstBullet).map(line => <li key={line}>{line.replace(/^•\s*/, '')}</li>)}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function LegalPageLayout({ kind, sections }: LegalPageLayoutProps) {
  const isPrivacy = kind === 'privacy';
  const Icon = isPrivacy ? ShieldCheck : FileText;
  const title = isPrivacy ? 'Privacy policy' : 'Terms & conditions';
  const tone = isPrivacy ? 'bg-brand-secondary-soft' : 'bg-brand-yellow-soft';
  const tableOfContents = (
    <ol className="space-y-1">
      {sections.map((section, index) => (
        <li key={section.title}>
          <a href={`#section-${index + 1}`} className="flex items-baseline gap-3 rounded-md px-3 py-2 text-sm text-muted-strong transition-colors duration-fast hover:bg-brand-yellow-soft hover:text-ink">
            <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-muted">{index + 1}.</span>
            <span>{section.title.replace(/^\d+\.\s*/, '')}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <PublicSiteLayout>
      <div id="document-top" className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-7 lg:px-8 lg:pb-12">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to Second Brain
          </Link>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="max-w-reading">
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
              <p className="mt-4 max-w-reading text-base text-muted sm:text-lg">
                {isPrivacy
                  ? 'How your information is collected, used, and protected in Second Brain.'
                  : 'The agreement that guides your use of Second Brain and its services.'}
              </p>
            </div>
            <div aria-hidden="true" className={`hidden h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-ink shadow-md sm:flex ${tone}`}>
              <Icon className="h-9 w-9" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl items-start gap-7 px-4 py-8 lg:grid-cols-legal lg:gap-12 lg:px-8 lg:py-12">
        <aside className="lg:sticky lg:top-8">
          <nav aria-label="On this page" className="hidden lg:block">
            <h2 className="mb-3 px-3 font-display text-lg font-bold">On this page</h2>
            {tableOfContents}
          </nav>
          <details className="sb-accordion rounded-md border-2 border-ink bg-surface lg:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 font-semibold">
              On this page <ChevronDown aria-hidden="true" className="sb-disclosure-icon h-5 w-5 shrink-0" />
            </summary>
            <nav aria-label="Document sections" className="border-t-2 border-ink p-2">{tableOfContents}</nav>
          </details>
          <div className="mt-6 hidden border-t-2 border-ink px-3 pt-5 lg:block">
            <p className="font-semibold">Have a question?</p>
            <a href="mailto:productora.analytics@gmail.com" className="mt-2 inline-flex items-center gap-2 text-sm text-muted-strong underline decoration-1 underline-offset-4 hover:text-ink">
              Contact Productora <Mail aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </aside>

        <article aria-label={title} className="min-w-0 rounded-xl border-2 border-ink bg-surface px-5 shadow-md sm:px-8 lg:px-10">
          {sections.map((section, index) => (
            <section id={`section-${index + 1}`} key={section.title} aria-labelledby={`section-heading-${index + 1}`}
              className="mx-auto max-w-prose scroll-mt-8 border-b-1 border-ink py-7 last:border-b-0 sm:py-8">
              <h2 id={`section-heading-${index + 1}`} className="mb-4 flex items-baseline gap-3 font-display text-xl font-bold sm:text-2xl">
                <span className="text-base tabular-nums text-muted">{index + 1}.</span>
                {section.title.replace(/^\d+\.\s*/, '')}
              </h2>
              <PolicyText content={section.content} />
            </section>
          ))}
          <div className="mx-auto flex max-w-prose flex-col gap-4 border-t-2 border-ink py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <Link to={isPrivacy ? '/terms-and-conditions' : '/privacy-policy'} className="font-semibold underline underline-offset-4">
              {isPrivacy ? 'Read our terms & conditions' : 'Read our privacy policy'}
            </Link>
            <a href="#document-top" className="inline-flex items-center gap-2 text-muted hover:text-ink">Back to top <ArrowUp aria-hidden="true" className="h-4 w-4" /></a>
          </div>
        </article>
      </div>
    </PublicSiteLayout>
  );
}
