import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import SocialLinks from '../SocialLinks';
import { writingDocs } from '../generatedContent';

export const metadata: Metadata = {
  title: 'Writing · Kevin Lin',
  description: 'Logbooks for projects and personal reflections.',
};

export default function WritingIndex() {
  return (
    <main className="tide-portfolio project-detail">
      <header className="gallery-header">
        <Link className="gallery-signature" href="/" aria-label="Kevin Lin, back home">kl.</Link>
        <nav>
          <Link href="/#projects">Projects</Link>
          <Link href="/writing">Writing</Link>
          <SocialLinks />
        </nav>
      </header>
      <section className="doc-index">
        <header className="doc-index-head">
          <div className="doc-index-heading">
            <Link className="doc-index-back" href="/#projects" aria-label="Back home"><ArrowLeft size={14} /></Link>
            <h1 className="doc-index-title">Writing</h1>
          </div>
          <p className="doc-index-intro">Logbooks for projects and personal reflections.</p>
        </header>
        <ul className="doc-list">
          {writingDocs.map((doc) => {
            const body = (
              <>
                <p className="gallery-date">{doc.dateLabel}</p>
                <h2>{doc.title}</h2>
                <p>{doc.summary}</p>
                <span className="doc-list-more">
                  {doc.externalUrl ? 'Read on Medium' : 'Read the note'} <ArrowUpRight size={15} />
                </span>
              </>
            );
            return (
              <li key={doc.slug}>
                {doc.externalUrl ? (
                  <a href={doc.externalUrl} target="_blank" rel="noreferrer">{body}</a>
                ) : (
                  <Link href={`/writing/${doc.slug}`}>{body}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      <footer className="gallery-footer">
        <span>Kevin Lin</span>
        <Link href="/#top">Back to top ↑</Link>
      </footer>
    </main>
  );
}
