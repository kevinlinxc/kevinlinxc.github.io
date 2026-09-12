import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import DocBody from '../../DocBody';
import SocialLinks from '../../SocialLinks';
import { engineeringDocs } from '../../generatedContent';

export function generateStaticParams() {
  return engineeringDocs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = engineeringDocs.find((entry) => entry.slug === slug);
  return doc ? { title: `${doc.title} · Kevin Lin`, description: doc.summary } : { title: 'Engineering · Kevin Lin' };
}

export default async function EngineeringPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = engineeringDocs.find((entry) => entry.slug === slug);
  if (!doc) return <main className="project-detail tide-portfolio"><p>Page not found.</p><Link href="/engineering">Return to engineering <ArrowLeft size={15} /></Link></main>;
  return (
    <main className="project-detail tide-portfolio">
      <header className="gallery-header">
        <Link className="gallery-signature" href="/" aria-label="Kevin Lin, back home">kl.</Link>
        <nav>
          <Link href="/writing">Writing</Link>
          <SocialLinks />
        </nav>
      </header>
      <article className="project-detail-content doc-article">
        <Link className="project-back" href="/engineering"><ArrowLeft size={15} /> All engineering</Link>
        <p className="gallery-date">{doc.dateLabel}</p>
        <h1>{doc.title}</h1>
        <p className="project-detail-description">{doc.summary}</p>
        <DocBody html={doc.html} />
      </article>
      <footer className="gallery-footer">
        <span>Kevin Lin</span>
        <Link href="/#top">Back to top ↑</Link>
      </footer>
    </main>
  );
}
