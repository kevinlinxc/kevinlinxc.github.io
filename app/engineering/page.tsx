import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import SocialLinks from '../SocialLinks';
import { engineeringDocs } from '../generatedContent';

export const metadata: Metadata = {
  title: 'Engineering · Kevin Lin',
  description: 'Engineering design teams Kevin Lin has worked with.',
};

export default function EngineeringIndex() {
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
            <div>
              <p className="gallery-date">Engineering</p>
              <h1 className="doc-index-title">Design teams</h1>
            </div>
          </div>
          <p className="doc-index-intro">Two student engineering teams I grew up in at UBC: aeronautics and robotics.</p>
        </header>
        <ul className="doc-list">
          {engineeringDocs.map((doc) => (
            <li key={doc.slug}>
              <Link href={`/engineering/${doc.slug}`}>
                <p className="gallery-date">{doc.dateLabel}</p>
                <h2>{doc.title}</h2>
                <p>{doc.summary}</p>
                <span className="doc-list-more">Read the page <ArrowUpRight size={15} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <footer className="gallery-footer">
        <span>Kevin Lin</span>
        <Link href="/#top">Back to top ↑</Link>
      </footer>
    </main>
  );
}
