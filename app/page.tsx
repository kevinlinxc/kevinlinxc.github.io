'use client';
import {useState} from 'react';
import AppleModeToggle from './AppleModeToggle';
import {ArrowDown,ArrowUpRight} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import SocialLinks from './SocialLinks';
import TideField from './TideField';
import {useScaffoldDive} from './useScaffoldDive';
import {projects} from './projects';
export default function Home(){
 const {root,overlay,dive,active,pinned,toggle}=useScaffoldDive();
 const [badAppleOnly,setBadAppleOnly]=useState(false);
 const visibleProjects=projects.filter(project=>!badAppleOnly||project.badApple);
 return <main ref={root} id="top" className="tide-portfolio" data-tide-gallery>
  <div className="portfolio-field"><TideField dive={dive}/></div>
  <AppleModeToggle active={active} onToggle={()=>toggle.current()}/>
  <div className="dive-periphery" aria-hidden="true"/>
  <div className="dive-hint" aria-hidden="true">↑ ↓ edges to travel · {pinned?'click':'release'} / Esc to return</div>
  <div className="dive-scene" aria-hidden="true" inert><div ref={overlay} className="dive-overlay"/></div>
  <div className="landing-intro">
  <header className="gallery-header"><a className="gallery-signature" href="#top" aria-label="Kevin Lin, back to the top">kl.</a><nav aria-label="Main navigation"><a href="#projects">Projects <ArrowDown size={14}/></a><Link href="/writing">Writing</Link><SocialLinks/></nav></header>
  <section className="profile-intro" aria-label="About Kevin Lin">
   <button type="button" className="profile-portrait" data-dive-trigger aria-label="Explore depth view. Drag to look around, or press Enter to toggle." aria-pressed={active} onClick={event=>{if(event.detail===0)toggle.current();}}><Image src="/assets/kevin-portrait.jpg" alt="Kevin Lin in front of the Golden Gate Bridge" fill sizes="(max-width: 1050px) 160px, 208px" priority unoptimized/></button>
   <div className="profile-copy"><h1>Kevin Lin</h1><p>Engineer & Digital Creative</p></div>
  </section>
  </div>
  <section id="projects" className="project-collection" aria-labelledby="projects-heading">
   <div className="collection-heading"><h2 id="projects-heading">Projects</h2><fieldset className="collection-filters" aria-label="Filter projects"><button type="button" aria-pressed={!badAppleOnly} onClick={()=>setBadAppleOnly(false)}>All</button><button type="button" aria-pressed={badAppleOnly} onClick={()=>setBadAppleOnly(true)}>Bad Apple</button></fieldset></div>
   <output className="sr-only">{visibleProjects.length} projects shown{badAppleOnly?', filtered to Bad Apple':''}</output>
   <div className="project-grid">{visibleProjects.map((project)=><article key={project.name} className="gallery-card" data-field-card>
     <div className="gallery-card-main">
     <div className="gallery-card-body">
     {project.image?<div className={`gallery-preview${project.imageFit==='contain'?' gallery-preview-contain':''}`}><Image src={project.image} alt={project.alt} fill sizes="(max-width: 700px) 90vw, (max-width: 1050px) 45vw, 360px" unoptimized/></div>:<div className="gallery-preview film-preview" aria-hidden="true"><span>{project.name}</span></div>}
     <div className="gallery-card-copy"><p className="gallery-date">{project.date.label}</p><h3>{project.name}</h3><p className="gallery-description">{project.description}</p>{project.note&&<p className="gallery-project-note">{project.note}</p>}</div>
     </div>
     {/^https?:/.test(project.url)?<a className="gallery-card-action" href={project.url} target="_blank" rel="noreferrer">{project.link}<ArrowUpRight size={16}/></a>:<Link className="gallery-card-action" href={project.url}>{project.link}<ArrowUpRight size={16}/></Link>}
     </div>
    {project.clips&&<ul className="gallery-clips">{project.clips.map(clip=><li key={clip.url}><a href={clip.url} target="_blank" rel="noreferrer">{clip.name}<ArrowUpRight size={13}/></a></li>)}</ul>}
   </article>)}</div>
  </section>
  <footer className="gallery-footer"><span>Kevin Lin</span><div><a href="#projects">Projects</a><Link href="/writing">Writing</Link><a href="#top">Back to Top ↑</a></div></footer>
 </main>;
}
