'use client';
import {useState,useSyncExternalStore} from 'react';
import {ArrowDown,ArrowUpRight,Pause,Play} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import TideField from './TideField';
import {projectHref,projects} from './story';
const subscribeScroll=(notify:()=>void)=>{window.addEventListener('scroll',notify,{passive:true});window.addEventListener('resize',notify);return()=>{window.removeEventListener('scroll',notify);window.removeEventListener('resize',notify);};};
const readScroll=()=>Math.max(0,window.scrollY/Math.max(1,window.innerHeight));
export default function Home(){
 const scroll=useSyncExternalStore(subscribeScroll,readScroll,()=>0);
 const [paused,setPaused]=useState(false);
 const [badAppleOnly,setBadAppleOnly]=useState(false);
 const visibleProjects=projects.filter(project=>!badAppleOnly||project.badApple);
 return <main id="top" className="tide-portfolio" data-tide-gallery>
  <div className="portfolio-field"><TideField paused={paused} scroll={scroll}/></div>
  <header className="gallery-header"><a className="gallery-signature" href="#top" aria-label="Kevin Lin, back to the top">kl.</a><nav aria-label="Main navigation"><a href="#projects">Projects <ArrowDown size={14}/></a><Link href="/engineering">Engineering</Link><Link href="/logbooks">Logbooks</Link><a href="https://github.com/kevinlinxc" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a><button className="gallery-pause" onClick={()=>setPaused(!paused)} aria-label={paused?'Resume field animation':'Pause field animation'} title={paused?'Resume motion':'Pause motion'}>{paused?<Play size={15}/>:<Pause size={15}/>}</button></nav></header>
  <section className="profile-intro" aria-label="About Kevin Lin">
   <div className="profile-portrait"><Image src="/assets/kevin-portrait.jpg" alt="Kevin Lin in front of the Golden Gate Bridge" fill sizes="(max-width: 700px) 132px, 176px" priority unoptimized/></div>
   <div className="profile-copy"><h1>Kevin Lin</h1><p>Engineer, Digital Artist, Musician.</p></div>
  </section>
  <section id="projects" className="project-collection" aria-labelledby="projects-heading">
   <div className="collection-heading"><h2 id="projects-heading">Projects</h2><fieldset className="collection-filters" aria-label="Filter projects"><button type="button" aria-pressed={!badAppleOnly} onClick={()=>setBadAppleOnly(false)}>All</button><button type="button" aria-pressed={badAppleOnly} onClick={()=>setBadAppleOnly(true)}>Bad Apple</button></fieldset></div>
   <output className="sr-only">{visibleProjects.length} projects shown{badAppleOnly?', filtered to Bad Apple':''}</output>
   <div className="project-grid">{visibleProjects.map((project)=><article key={project.name} className="gallery-card" data-field-card>
     <div className="gallery-card-main">
     <Link href={projectHref(project)} className="gallery-card-link">
     {project.image?<div className={`gallery-preview${project.imageFit==='contain'?' gallery-preview-contain':''}`}><Image src={project.image} alt={project.alt} fill sizes="(max-width: 700px) 90vw, (max-width: 1050px) 45vw, 360px" unoptimized/></div>:<div className="gallery-preview film-preview" aria-hidden="true"><span>{project.name}</span></div>}
     <div className="gallery-card-copy"><p className="gallery-date" aria-label={project.date.approximate?`Approximate date: ${project.date.label.replace('c. ','')}`:project.date.label}>{project.date.label}</p><h3>{project.name}</h3><p className="gallery-description">{project.description}</p>{project.note&&<p className="gallery-project-note">{project.note}</p>}</div>
     </Link>
     {/^https?:/.test(project.url)?<a className="gallery-card-action" href={project.url} target="_blank" rel="noreferrer">{project.link}<ArrowUpRight size={16}/></a>:<Link className="gallery-card-action" href={projectHref(project)}>{project.link}<ArrowUpRight size={16}/></Link>}
     </div>
    {project.clips&&<ul className="gallery-clips">{project.clips.map(clip=><li key={clip.url}><a href={clip.url} target="_blank" rel="noreferrer">{clip.name}<ArrowUpRight size={13}/></a></li>)}</ul>}
   </article>)}</div>
  </section>
  <footer className="gallery-footer"><span>Kevin Lin</span><div><a href="https://www.youtube.com/@linguinelabs" target="_blank" rel="noreferrer">YouTube <ArrowUpRight size={13}/></a><Link href="/engineering">Engineering</Link><Link href="/logbooks">Logbooks</Link><a href="#top">Back to top ↑</a></div></footer>
 </main>;
}
