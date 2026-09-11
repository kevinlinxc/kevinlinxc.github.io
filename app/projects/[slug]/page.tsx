import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import DocBody from '../../DocBody';
import { projectDocs } from '../../generatedContent';
import { projectBySlug, projectSlug, projects } from '../../projects';

export function generateStaticParams(){return projects.filter(project=>project.section!=='engineering').map(project=>({slug:projectSlug(project.name)}));}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const project=projectBySlug(slug);
 return project?{title:`${project.name} · Kevin Lin`,description:project.description}:{title:'Project · Kevin Lin'};
}

export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const project=projectBySlug(slug);
 if(!project)return <main className="project-detail tide-portfolio"><p>Project not found.</p><Link href="/">Return home <ArrowLeft size={15}/></Link></main>;
 return <main className="project-detail tide-portfolio">
  <header className="gallery-header"><Link className="gallery-signature" href="/" aria-label="Kevin Lin, back home">kl.</Link><nav><Link href="/#projects"><ArrowLeft size={14}/> All projects</Link><a href="https://github.com/kevinlinxc" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a></nav></header>
  <article className="project-detail-content">
   <Link className="project-back" href="/#projects"><ArrowLeft size={15}/> Back to all projects</Link>
   <p className="gallery-date">{project.date.label}</p>
   <h1>{project.name}</h1>
   <p className="project-detail-description">{project.description}</p>
   {project.note&&<p className="gallery-project-note">{project.note}</p>}
   {project.image&&<div className={`project-detail-image${project.imageFit==='contain'?' project-detail-image-contain':''}`}><Image src={project.image} alt={project.alt} fill sizes="(max-width: 900px) 100vw, 850px" unoptimized priority/></div>}
   {!project.image&&<div className="project-detail-field"><span>{project.name}</span></div>}
   {projectDocs[slug]&&<DocBody html={projectDocs[slug].html}/>}
   <div className="project-detail-actions"><a className="project-primary-link" href={project.url} target="_blank" rel="noreferrer">{project.link} <ArrowUpRight size={17}/></a>{project.clips?.map(clip=><a key={clip.url} href={clip.url} target="_blank" rel="noreferrer">{clip.name} <ArrowUpRight size={15}/></a>)}</div>
   {project.name==='Bad Apple but it’s Strava'&&<p className="project-private-note">This project is private while it is in progress. The repository will be public once it is finished.</p>}
  </article>
  <footer className="gallery-footer"><span>Kevin Lin</span><Link href="/#top">Back to top ↑</Link></footer>
 </main>;
}
