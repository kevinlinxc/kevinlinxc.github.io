import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import DocBody from '../../DocBody';
import { logbookDocs } from '../../generatedContent';

export function generateStaticParams() {
  return logbookDocs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = logbookDocs.find((entry) => entry.slug === slug);
  return doc ? { title: `${doc.title} · Kevin Lin`, description: doc.summary } : { title: 'Logbooks · Kevin Lin' };
}

export default async function LogbookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = logbookDocs.find((entry) => entry.slug === slug);
  if (!doc) return <main className="project-detail tide-portfolio"><p>Page not found.</p><Link href="/logbooks">Return to logbooks <ArrowLeft size={15} /></Link></main>;
  return (
    <main className="project-detail tide-portfolio">
      <header className="gallery-header">
        <Link className="gallery-signature" href="/" aria-label="Kevin Lin, back home">kl.</Link>
        <nav>
          <Link href="/logbooks"><ArrowLeft size={14} /> Logbooks</Link>
          <Link href="/engineering">Engineering</Link>
          <a href="https://github.com/kevinlinxc" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a>
        </nav>
      </header>
      <article className="project-detail-content doc-article">
        <Link className="project-back" href="/logbooks"><ArrowLeft size={15} /> All logbooks</Link>
        <p className="gallery-date">{doc.dateLabel}</p>
        <h1>{doc.title}</h1>
        {doc.summary && <p className="project-detail-description">{doc.summary}</p>}
        {doc.externalUrl ? (
          <p><a className="project-primary-link" href={doc.externalUrl} target="_blank" rel="noreferrer">Read the full note <ArrowUpRight size={15} /></a></p>
        ) : (
          <DocBody html={doc.html} />
        )}
      </article>
      <footer className="gallery-footer">
        <span>Kevin Lin</span>
        <Link href="/#top">Back to top ↑</Link>
      </footer>
    </main>
  );
}
