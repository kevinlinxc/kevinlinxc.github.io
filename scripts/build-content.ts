import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

type FrontMatter = Record<string, string>;

type Doc = {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  summary: string;
  externalUrl?: string;
  html: string;
};

type BuildDocInput = {
  file: string;
  sourceDir: string;
  slug: string;
  title?: string;
  section: string;
};

const root = process.cwd();
const contentDir = path.join(root, 'content');
const outFile = path.join(root, 'app', 'generatedContent.ts');
const publicDir = path.join(root, 'public', 'assets');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatDate(iso: string): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${months[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

function parseFrontMatter(raw: string): { meta: FrontMatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: raw };
  const meta: FrontMatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[kv[1]] = value;
  }
  return { meta, body: raw.slice(match[0].length) };
}

function mapOutsideCode(body: string, transform: (segment: string) => string): string {
  return body
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/)
    .map((part, index) => (index % 2 === 1 ? part : transform(part)))
    .join('');
}

function convertShortcodes(body: string): string {
  return body
    .replace(/\{\{<\s*(?:youtube|youtubegif)\s+([^>]+?)\s*>\}\}/g, (_match: string, id: string) => {
      const clean = id.replace(/[^A-Za-z0-9_-]/g, '');
      return `\n\n<div class="doc-embed"><iframe src="https://www.youtube.com/embed/${clean}" title="YouTube video ${clean}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>\n\n`;
    })
    .replace(/\{\{<\/\*\s*([\s\S]*?)\s*\*\/>\}\}/g, (_match: string, inner: string) => '`{{< ' + inner + ' >}}`');
}

function copyImages(body: string, sourceDir: string, assetKey: string): string {
  return body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full: string, alt: string, src: string) => {
    if (/^[a-z]+:\/\//i.test(src) || src.startsWith('/')) return full;
    const absolute = path.resolve(sourceDir, src);
    if (!fs.existsSync(absolute)) return '';
    const destDir = path.join(publicDir, assetKey);
    fs.mkdirSync(destDir, { recursive: true });
    const base = path.basename(src);
    fs.copyFileSync(absolute, path.join(destDir, base));
    return `![${alt}](/assets/${assetKey}/${base})`;
  });
}

function buildDoc({ file, sourceDir, slug, title, section }: BuildDocInput): Doc {
  const raw = fs.readFileSync(file, 'utf8');
  const { meta, body } = parseFrontMatter(raw);
  const withEmbeds = mapOutsideCode(body, convertShortcodes);
  const withImages = mapOutsideCode(withEmbeds, (segment) => copyImages(segment, sourceDir, `${section}/${slug}`));
  const html = marked.parse(withImages) as string;
  return {
    slug,
    title: title ?? meta.title ?? slug,
    date: meta.date ?? '',
    dateLabel: formatDate(meta.date ?? ''),
    summary: meta.summary ?? '',
    externalUrl: meta.externalUrl || undefined,
    html,
  };
}

const engineering = [
  { dir: 'UBC AeroDesign', slug: 'ubc-aerodesign' },
  { dir: 'UBC Rover', slug: 'ubc-rover' },
].map(({ dir, slug }) =>
  buildDoc({
    file: path.join(contentDir, 'engineering', dir, 'index.md'),
    sourceDir: path.join(contentDir, 'engineering', dir),
    slug,
    section: 'engineering',
  }),
);

const projectSlugs = ['stemformulas', 'b-flat', 'desynthesia'];
const projectDocs = Object.fromEntries(
  projectSlugs.map((slug) => [
    slug,
    buildDoc({
      file: path.join(contentDir, 'engineering', slug, 'index.md'),
      sourceDir: path.join(contentDir, 'engineering', slug),
      slug,
      section: 'projects',
    }),
  ]),
);

const logbookSources = fs
  .readdirSync(path.join(contentDir, 'logbooks'), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md')
  .map((entry) => ({ file: path.join(contentDir, 'logbooks', entry.name), slug: entry.name.replace(/\.md$/, '') }));

const wslFile = path.join(contentDir, 'logbooks', 'wsl-logbook', 'index.md');
if (fs.existsSync(wslFile)) logbookSources.push({ file: wslFile, slug: 'wsl-logbook' });

const logbooks = logbookSources
  .map(({ file, slug }) =>
    buildDoc({
      file,
      sourceDir: path.dirname(file),
      slug,
      section: 'logbooks',
    }),
  )
  .sort((a, b) => (a.date < b.date ? 1 : -1));

const banner = '// Generated by scripts/build-content.ts. Do not edit by hand.\n';
const output =
  banner +
  'export type Doc={slug:string;title:string;date:string;dateLabel:string;summary:string;externalUrl?:string;html:string};\n' +
  `export const engineeringDocs:Doc[]=${JSON.stringify(engineering, null, 2)};\n` +
  `export const projectDocs:Record<string,Doc>=${JSON.stringify(projectDocs, null, 2)};\n` +
  `export const logbookDocs:Doc[]=${JSON.stringify(logbooks, null, 2)};\n`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, output);
console.log(
  `Generated ${engineering.length} engineering docs, ${Object.keys(projectDocs).length} project docs, ${logbooks.length} logbooks.`,
);
