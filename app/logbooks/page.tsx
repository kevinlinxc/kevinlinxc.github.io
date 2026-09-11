import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { logbookDocs } from '../generatedContent';

export const metadata: Metadata = {
  title: 'Logbooks · Kevin Lin',
  description: 'Technical notes and things worth writing down.',
};

export default function LogbooksIndex() {
  return (
    <main className="tide-portfolio project-detail">
      <header className="gallery-header">
        <Link className="gallery-signature" href="/" aria-label="Kevin Lin, back home">kl.</Link>
        <nav>
          <Link href="/#projects">Projects</Link>
          <Link href="/engineering">Engineering</Link>
          <a href="https://github.com/kevinlinxc" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a>
        </nav>
      </header>
      <section className="doc-index">
        <Link className="project-back" href="/#projects"><ArrowLeft size={15} /> Back home</Link>
        <p className="gallery-date">Logbooks</p>
        <h1 className="doc-index-title">Notes</h1>
        <p className="doc-index-intro">Anything technical I have found useful to write down.</p>
        <ul className="doc-list">
          {logbookDocs.map((doc) => {
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
                  <Link href={`/logbooks/${doc.slug}`}>{body}</Link>
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
