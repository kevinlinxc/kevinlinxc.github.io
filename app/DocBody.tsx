export default function DocBody({ html }: { html: string }) {
  return <div className="doc-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
