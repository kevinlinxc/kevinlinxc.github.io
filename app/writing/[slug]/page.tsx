import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import DocBody from '../../DocBody';
import SocialLinks from '../../SocialLinks';
import { writingDocs } from '../../generatedContent';

export function generateStaticParams() {
  return writingDocs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = writingDocs.find((entry) => entry.slug === slug);
  return doc ? { title: `${doc.title} · Kevin Lin`, description: doc.summary } : { title: 'Writing · Kevin Lin' };
}

export default async function WritingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = writingDocs.find((entry) => entry.slug === slug);
  if (!doc) return <main className="project-detail tide-portfolio"><p>Page not found.</p><Link href="/writing">Return to writing <ArrowLeft size={15} /></Link></main>;
  return (
    <main className="project-detail tide-portfolio">
      <header className="gallery-header">
        <Link className="gallery-signature" href="/" aria-label="Kevin Lin, back home">kl.</Link>
        <nav>
          <Link href="/#projects">Projects</Link>
          <Link href="/writing"><ArrowLeft size={14} /> Writing</Link>
          <SocialLinks />
        </nav>
      </header>
      <article className="project-detail-content doc-article">
        <Link className="project-back" href="/writing"><ArrowLeft size={15} /> All writing</Link>
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
