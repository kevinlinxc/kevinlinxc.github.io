type ProjectDate = { label: string; sort: number };
type Project = { name: string; description: string; url: string; link: string; image: string | null; alt: string; date: ProjectDate; badApple?: boolean; note?: string; imageFit?: 'cover' | 'contain'; section?: 'projects' | 'engineering'; clips?: { name: string; url: string }[] };
const projectEntries: Project[] = [
  {
    "name": "Bad Apple but it's Strava",
    "badApple": true,
    "description": "(In Progress) Making Bad Apple but with Strava GPS data.",
    "url": "https://www.instagram.com/reel/DcWgIfHJS_I/",
    "link": "Video",
    "image": null,
    "alt": "",
    "note": "The repository will be public once the project is finished.",
    "clips": [
      {
        "name": "GitHub · private for now",
        "url": "https://github.com/kevinlinxc/badapple-strava"
      }
    ],
    "date": {
      "label": "In progress",
      "sort": 99999999
    }
  },
  {
    "name": "Bed Apple",
    "description": "Bad Apple rendered in Apple Health as sleep stages.",
    "url": "https://www.youtube.com/shorts/2Z1TdxEGbhU",
    "link": "Video",
    "image": "/assets/projects/bad-apple-sleep.webp",
    "alt": "Bad Apple rendered in Apple Health sleep-stage charts",
    "badApple": true,
    "clips": [
      {
        "name": "Source Code",
        "url": "https://github.com/kevinlinxc/badapple-sleep"
      }
    ],
    "date": {
      "label": "July 2026",
      "sort": 20260726
    }
  },
  {
    "name": "Vim Vim Revolution",
    "description": "A rhythm game where you have to type the lyrics in time while navigating a vim editor.",
    "url": "https://github.com/kevinlinxc/vim-vim-revolution",
    "link": "Play the game",
    "image": "/assets/projects/vim-vim-revolution.webp",
    "alt": "Vim Vim Revolution logo",
    "imageFit": "contain",
    "date": {
      "label": "May 2026",
      "sort": 20260526
    }
  },
  {
    "name": "Viewlingo",
    "description": "3rd-place YC Hackathon project that translated objects in your smart glasses field of view and created interactive flashcards for review on your phone.",
    "url": "https://github.com/kevinlinxc/viewlingo",
    "link": "Explore the project",
    "image": null,
    "alt": "",
    "date": {
      "label": "July 2025",
      "sort": 20250712
    }
  },
  {
    "name": "Sheet Music Smart Glasses",
    "description": "I put sheet music into Even Realities G2s and made a video about it.",
    "url": "https://www.youtube.com/watch?v=j36u2i7PKKE",
    "link": "Video",
    "image": "/assets/projects/smart-glasses-sheet-music.webp",
    "alt": "Smart glasses sheet music demonstration",
    "date": {
      "label": "April 2025",
      "sort": 20250425
    }
  },
  {
    "name": "Pokérogue Biomes",
    "description": "An interactive map and routing tool for the roguelike Pokémon game Pokérogue.",
    "url": "https://pokerogue-biomes.vercel.app/",
    "link": "Explore the map",
    "image": "/assets/projects/poke-rogue-biomes.webp",
    "alt": "Pokérogue Biomes interactive route map",
    "date": {
      "label": "2025-2026",
      "sort": 20250209
    }
  },
  {
    "name": "Bad Apple PDF",
    "badApple": true,
    "description": "Bad Apple playing inside a PDF.",
    "url": "https://www.youtube.com/watch?v=hi_j8q5-vTU",
    "link": "Video",
    "image": "/assets/projects/bad-apple-pdf.webp",
    "alt": "Bad Apple animation playing inside a PDF",
    "date": {
      "label": "January 2025",
      "sort": 20250119
    },
    "clips": [
      {
        "name": "Source Code",
        "url": "https://github.com/kevinlinxc/badapple-pdf"
      }
    ]
  },
  {
    "name": "Engineering Physics All At Once",
    "description": "My highest effort short film production, eight months of writing, shooting and editing, with more than 50 visual effects shots.",
    "url": "https://www.youtube.com/watch?v=nY0l1DbMbm0",
    "link": "Video",
    "image": "/assets/projects/engineering-physics-all-at-once.webp",
    "alt": "Engineering Physics All At Once short film",
    "date": {
      "label": "December 2024",
      "sort": 20241223
    }
  },
  {
    "name": "Ultrasonic Holography",
    "description": "Our capstone project: pushing the open-source frontier of ultrasonic array levitation.",
    "url": "https://github.com/ultrasonic-homies/ultrasonic-holography",
    "link": "Github",
    "image": "/assets/projects/ultrasonic-holography.webp",
    "alt": "Ultrasonic Holography capstone hardware and demonstrations",
    "date": {
      "label": "Sep 2023-Jun 2024",
      "sort": 20240601
    }
  },
  {
    "name": "Bad Apple but it's 3Blue1Brown",
    "badApple": true,
    "description": "Bad Apple animated with Manim, 3Blue1Brown's animation software",
    "url": "https://www.youtube.com/watch?v=t0N0dZTsn-w",
    "link": "Video",
    "image": "/assets/projects/bad-apple-but-it-s-3blue1brown.webp",
    "alt": "Bad Apple in the style of 3Blue1Brown",
    "date": {
      "label": "May 2024",
      "sort": 20240505
    }
  },
  {
    "name": "Bad Apple with apples",
    "badApple": true,
    "description": "Stop motion Bad Apple with 700 plastic apples in my living room",
    "url": "https://www.youtube.com/watch?v=lT-fdnIK0k0",
    "link": "Video",
    "image": "/assets/projects/bad-apple-irl.webp",
    "alt": "Kevin's Bad Apple!! project using plastic apples as pixels",
    "date": {
      "label": "2023-2024",
      "sort": 20240227
    }
  },
  {
    "name": "UBC AeroDesign",
    "description": "UBC's SAE AeroDesign design team, where I led the software team and built a ground station with telemetry dashboards and computer-vision + GPS tooling.",
    "url": "/engineering/ubc-aerodesign",
    "link": "Read more",
    "section": "engineering",
    "image": "/assets/projects/ubc-aerodesign.webp",
    "alt": "UBC AeroDesign aircraft project",
    "date": {
      "label": "2020-2024",
      "sort": 20240125
    }
  },
  {
    "name": "UBC Rover",
    "description": "UBC's autonomous rover team, where I worked on ROS software and motor and controller integration.",
    "url": "/engineering/ubc-rover",
    "link": "Read more",
    "section": "engineering",
    "image": "/assets/projects/ubc-rover.webp",
    "alt": "UBC Rover motors, drivers, and batteries",
    "date": {
      "label": "2018-2021",
      "sort": 20210904
    }
  },
  {
    "name": "stemformulas",
    "description": "A STEM formula database, built to help you instantly find verified equations.",
    "url": "https://stemformulas.com/",
    "link": "Visit stemformulas.com",
    "image": "/assets/projects/stemformulas.webp",
    "alt": "stemformulas website",
    "date": {
      "label": "2022-2025",
      "sort": 20250603
    }
  },
  {
    "name": "The Fizz Buzz",
    "description": "A short film we made parodying 'The Hustle' by Krazam",
    "url": "https://www.youtube.com/watch?v=uP5d3sofYjM",
    "link": "Video",
    "image": "/assets/projects/the-fizz-buzz.webp",
    "alt": "The Fizz Buzz",
    "date": {
      "label": "January 2022",
      "sort": 20220121
    }
  },
  {
    "name": "B-Flat",
    "description": "Converting piano sheet music into one continuous line, so it can be scrolled across a phone.",
    "url": "https://www.youtube.com/watch?v=eH59qLFLyjQ",
    "link": "Video",
    "image": "/assets/projects/b-flat.webp",
    "alt": "B-Flat sheet music project",
    "date": {
      "label": "August 2021",
      "sort": 20210831
    }
  },
  {
    "name": "DeSynthesia",
    "description": "Unsuccesfully turning piano tutorial videos into MIDI and sheet music with computer vision.",
    "url": "https://github.com/kevinlinxc/DeSynthesia",
    "link": "Source Code",
    "image": "/assets/projects/desynthesia.webp",
    "alt": "DeSynthesia piano note detection project",
    "date": {
      "label": "August 2021",
      "sort": 20210808
    }
  },
  { 
    "name": "Minecraft Short Film Edits",
    "description": "Our program's Minecraft short film featuring my voice and Minecraft-style credits I made.",
    "url": "https://www.youtube.com/watch?v=e0T8pkWdL0A",
    "link": "Video",
    "image": "/assets/projects/title-sequences.webp",
    "alt": "Fizz FilmfEUSt 2021, featuring Minecraft-style credits",
    "date": {
      "label": "January 2021",
      "sort": 20210122
    },
  },
  {
    "name": "Northernlion Edits",
    "description": "Edits I made of Northernlion's content.",
    "url": "https://youtube.com/playlist?list=PL2FEA11Ym8EMiM2s7vQZWy8Kjzf-eU9MY",
    "link": "Playlist",
    "image": "/assets/projects/northernlion-edits.webp",
    "alt": "Repentance-style title card from Northernlion Edits",
    "date": {
      "label": "2020-2021",
      "sort": 20210101
    },
  },
  {
    "name": "League of Legends × Avatar",
    "description": "A League of Legends parody of the Avatar: The Last Airbender opening.",
    "url": "https://www.youtube.com/watch?v=Bn4TmxhCmTI",
    "link": "Video",
    "image": "/assets/projects/league-of-legends-avatar.webp",
    "alt": "League of Legends × Avatar",
    "date": {
      "label": "2021",
      "sort": 20210101
    }
  },
  {
    "name": "Vancouver Canucks Anime Intro",
    "description": "A Naruto-style opening for the Vancouver Canucks.",
    "url": "https://www.youtube.com/watch?v=j006agGDLzI",
    "link": "Video",
    "image": "/assets/projects/vancouver-canucks-anime-intro.webp",
    "alt": "Vancouver Canucks Anime Intro",
    "date": {
      "label": "September 2020",
      "sort": 20200901
    }
  },
  {
    "name": "iSkaarly",
    "description": "A League of Legends parody of the iCarly opening.",
    "url": "https://www.youtube.com/watch?v=smE9CrlCH8k",
    "link": "Video",
    "image": "/assets/projects/iskaarly.webp",
    "alt": "iSkaarly",
    "date": {
      "label": "May 2019",
      "sort": 20190531
    }
  },
  {
    "name": "League of Legends Marvel Title Card",
    "description": "A Marvel-style title card made with Cinema 4D and the Adobe Suite, following a tutorial.",
    "url": "https://www.youtube.com/watch?v=oJk8Fu7QD_U",
    "link": "Video",
    "image": "/assets/projects/league-of-legends-marvel.webp",
    "alt": "League of Legends · Marvel",
    "date": {
      "label": "March 2019",
      "sort": 20190325
    }
  },
  {
    "name": "League of Legends · Infinity War",
    "description": "An Infinity War-style title card for League of Legends, made in Cinema 4D following a tutorial.",
    "url": "https://www.youtube.com/watch?v=LJ9LdVM_OPU",
    "link": "Video",
    "image": "/assets/projects/league-of-legends-infinity-war.webp",
    "alt": "League of Legends · Infinity War",
    "date": {
      "label": "2019",
      "sort": 20190101
    }
  }
];
export const projects = [...projectEntries].sort((a, b) => b.date.sort - a.date.sort);
export function projectSlug(name: string) { return name.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function projectBySlug(slug: string) { return projects.find(project => projectSlug(project.name) === slug); }
export function projectHref(project: { name: string; section?: 'projects' | 'engineering' }) { return project.section === 'engineering' ? `/engineering/${projectSlug(project.name)}` : `/projects/${projectSlug(project.name)}`; }
