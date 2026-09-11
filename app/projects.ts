type ProjectDate = { label: string; sort: number; source: string; approximate: boolean };
type Project = { name: string; description: string; url: string; link: string; image: string | null; alt: string; date: ProjectDate; badApple?: boolean; note?: string; imageFit?: 'cover' | 'contain'; section?: 'projects' | 'engineering'; clips?: { name: string; url: string }[] };
const projectEntries: Project[] = [
  {
    "name": "Bad Apple but it’s Strava",
    "badApple": true,
    "description": "A Strava take on Bad Apple. Watch a preview of the work in progress.",
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
      "sort": 99999999,
      "source": "User confirmed project is in progress.",
      "approximate": false
    }
  },
  {
    "name": "Bad Apple Sleep",
    "description": "Bad Apple rendered as sleep-stage charts in Apple Health, using a Python converter and a Swift HealthKit app.",
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
      "sort": 20260726,
      "source": "Video published July 26, 2026, matching the public repository creation date.",
      "approximate": false
    }
  },
  {
    "name": "Vim Vim Revolution",
    "description": "Practice Vim under pressure: navigate a file and type scattered song lyrics in time with the music.",
    "url": "https://github.com/kevinlinxc/vim-vim-revolution",
    "link": "Explore the game",
    "image": "/assets/projects/vim-vim-revolution.webp",
    "alt": "Vim Vim Revolution logo",
    "imageFit": "contain",
    "date": {
      "label": "c. 2026",
      "sort": 20260526,
      "source": "Repository created May 26, 2026; project year awaiting confirmation.",
      "approximate": true
    }
  },
  {
    "name": "Viewlingo",
    "description": "Learn words from the world around you with smart-glasses translations, flashcards, quizzes, and conversation practice.",
    "url": "https://github.com/kevinlinxc/viewlingo",
    "link": "Explore the project",
    "image": null,
    "alt": "",
    "date": {
      "label": "c. 2025",
      "sort": 20250712,
      "source": "Repository created July 12, 2025; project year awaiting confirmation.",
      "approximate": true
    }
  },
  {
    "name": "Smart Glasses Sheet Music",
    "description": "Sheet music in your field of view, so you can see the score and your hands at the same time.",
    "url": "https://www.youtube.com/watch?v=j36u2i7PKKE",
    "link": "Video",
    "image": "/assets/projects/smart-glasses-sheet-music.webp",
    "alt": "Smart glasses sheet music demonstration",
    "date": {
      "label": "April 2025",
      "sort": 20250425,
      "source": "Public demo published April 25, 2025.",
      "approximate": false
    }
  },
  {
    "name": "Pokérogue Biomes",
    "description": "Find Pokémon habitats and plan routes through Pokérogue, balancing distance with the odds of getting there.",
    "url": "https://pokerogue-biomes.vercel.app/",
    "link": "Explore the map",
    "image": "/assets/projects/poke-rogue-biomes.webp",
    "alt": "Pokérogue Biomes interactive route map",
    "date": {
      "label": "c. 2025",
      "sort": 20250209,
      "source": "Repository created February 9, 2025; project year awaiting confirmation.",
      "approximate": true
    }
  },
  {
    "name": "Bad Apple PDF",
    "badApple": true,
    "description": "Bad Apple playing inside a PDF. An experiment in what a document can do, viewed in a browser.",
    "url": "https://www.youtube.com/watch?v=hi_j8q5-vTU",
    "link": "Video",
    "image": "/assets/projects/bad-apple-pdf.webp",
    "alt": "Bad Apple animation playing inside a PDF",
    "date": {
      "label": "January 2025",
      "sort": 20250119,
      "source": "User-supplied video published January 19, 2025.",
      "approximate": false
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
    "description": "Eight months of work and more than 50 visual effects shots, with rotoscoping, compositing, and tracking.",
    "url": "https://www.youtube.com/watch?v=nY0l1DbMbm0",
    "link": "Video",
    "image": "/assets/projects/engineering-physics-all-at-once.webp",
    "alt": "Engineering Physics All At Once short film",
    "date": {
      "label": "December 2024",
      "sort": 20241223,
      "source": "Existing portfolio says 2024; film published December 23, 2024.",
      "approximate": false
    }
  },
  {
    "name": "Ultrasonic Holography",
    "description": "Our custom ultrasonic array levitates beads, plays sound, and creates haptic feedback in midair.",
    "url": "https://github.com/ultrasonic-homies/ultrasonic-holography",
    "link": "Explore the capstone",
    "image": "/assets/projects/ultrasonic-holography.webp",
    "alt": "Ultrasonic Holography capstone hardware and demonstrations",
    "date": {
      "label": "Sep 2023–Jun 2024",
      "sort": 20240601,
      "source": "User-confirmed capstone timeline: September 2023 through June 2024.",
      "approximate": false
    }
  },
  {
    "name": "Bad Apple but it’s 3Blue1Brown",
    "badApple": true,
    "description": "Bad Apple reimagined through Fourier series, calculus, and vector fields, animated with Manim.",
    "url": "https://www.youtube.com/watch?v=t0N0dZTsn-w",
    "link": "Video",
    "image": "/assets/projects/bad-apple-but-it-s-3blue1brown.webp",
    "alt": "Bad Apple in the style of 3Blue1Brown",
    "date": {
      "label": "May 2024",
      "sort": 20240505,
      "source": "Film published May 5, 2024.",
      "approximate": false
    }
  },
  {
    "name": "Bad Apple!! IRL",
    "badApple": true,
    "description": "More than 700 plastic apples. One stop-motion music video. A year of figuring out how to make an unlikely screen.",
    "url": "https://www.youtube.com/watch?v=lT-fdnIK0k0",
    "link": "Video",
    "image": "/assets/projects/bad-apple-irl.webp",
    "alt": "Kevin’s Bad Apple!! project using plastic apples as physical pixels",
    "date": {
      "label": "2023–2024",
      "sort": 20240227,
      "source": "Existing write-up describes work in 2023 and is dated February 27, 2024.",
      "approximate": false
    }
  },
  {
    "name": "UBC AeroDesign",
    "description": "UBC’s SAE airplane design team, where I led software and built telemetry dashboards and computer-vision tooling.",
    "url": "/engineering/ubc-aerodesign",
    "link": "Read the team page",
    "section": "engineering",
    "image": "/assets/projects/ubc-aerodesign.webp",
    "alt": "UBC AeroDesign aircraft project",
    "date": {
      "label": "2020–2024",
      "sort": 20240125,
      "source": "Case study: on the team 2020–2024 and software lead for the last two years; page dated January 25, 2024.",
      "approximate": false
    }
  },
  {
    "name": "UBC Rover",
    "description": "UBC’s autonomous rover team (formerly Snowbots), where I worked on ROS software and motor and controller integration.",
    "url": "/engineering/ubc-rover",
    "link": "Read the team page",
    "section": "engineering",
    "image": "/assets/projects/ubc-rover.webp",
    "alt": "UBC Rover motors, drivers, and batteries",
    "date": {
      "label": "2018–2021",
      "sort": 20210904,
      "source": "Case study: on the team 2018–2021, ending as integration lead; page dated September 4, 2021.",
      "approximate": false
    }
  },
  {
    "name": "stemformulas",
    "description": "A collection of STEM formulas, built to make the right equation easier to find.",
    "url": "https://stemformulas.com/",
    "link": "Visit stemformulas.com",
    "image": "/assets/projects/stemformulas.webp",
    "alt": "stemformulas website",
    "date": {
      "label": "2022–present",
      "sort": 99999998,
      "source": "User-confirmed project timeline: 2022 to present.",
      "approximate": false
    }
  },
  {
    "name": "The Fizz Buzz",
    "description": "A short film from my university years.",
    "url": "https://www.youtube.com/watch?v=uP5d3sofYjM",
    "link": "Video",
    "image": "/assets/projects/the-fizz-buzz.webp",
    "alt": "The Fizz Buzz",
    "date": {
      "label": "January 2022",
      "sort": 20220121,
      "source": "Original portfolio year, or public release date where available.",
      "approximate": false
    }
  },
  {
    "name": "B-Flat",
    "description": "Unfolding sheet music into one continuous line, so it can scroll across a phone.",
    "url": "https://www.youtube.com/watch?v=eH59qLFLyjQ",
    "link": "Video",
    "image": "/assets/projects/b-flat.webp",
    "alt": "B-Flat sheet music project",
    "date": {
      "label": "August 2021",
      "sort": 20210831,
      "source": "Existing portfolio page dated August 31, 2021; repository was imported later.",
      "approximate": false
    }
  },
  {
    "name": "DeSynthesia",
    "description": "Turning piano tutorial videos into MIDI and sheet music with computer vision.",
    "url": "https://github.com/kevinlinxc/DeSynthesia",
    "link": "Source Code",
    "image": "/assets/projects/desynthesia.webp",
    "alt": "DeSynthesia piano note detection project",
    "date": {
      "label": "August 2021",
      "sort": 20210808,
      "source": "Existing portfolio page dated August 8, 2021.",
      "approximate": false
    }
  },
  {
    "name": "Title sequences",
    "description": "An Invincible-style title card and Minecraft-style credits for FilmfEUSt.",
    "url": "https://www.youtube.com/watch?v=e0T8pkWdL0A",
    "link": "Video",
    "image": "/assets/projects/title-sequences.webp",
    "alt": "Fizz FilmfEUSt 2021, featuring Minecraft-style credits",
    "date": {
      "label": "January 2021",
      "sort": 20210122,
      "source": "Featured FilmfEUSt video supplied by the user, published January 22, 2021.",
      "approximate": false
    },
    "clips": [
      {
        "name": "Invincible title card",
        "url": "https://www.youtube.com/watch?v=mkClF8ccwWw"
      }
    ]
  },
  {
    "name": "Northernlion Edits",
    "description": "Edits inspired by Northernlion, featuring a Repentance-style title card.",
    "url": "https://youtube.com/playlist?list=PL2FEA11Ym8EMiM2s7vQZWy8Kjzf-eU9MY",
    "link": "Video",
    "image": "/assets/projects/northernlion-edits.webp",
    "alt": "Repentance-style title card from Northernlion Edits",
    "date": {
      "label": "2020–2021",
      "sort": 20210101,
      "source": "User-confirmed project timeline: 2020 through 2021.",
      "approximate": false
    },
    "clips": [
      {
        "name": "Featured: Repentance title card",
        "url": "https://www.youtube.com/watch?v=zrjLy_80L6c"
      }
    ]
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
      "sort": 20210101,
      "source": "Original portfolio year, or public release date where available.",
      "approximate": false
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
      "sort": 20200901,
      "source": "Original portfolio year, or public release date where available.",
      "approximate": false
    }
  },
  {
    "name": "iSkaarly",
    "description": "The iCarly opening reimagined for League of Legends, with manually corner-pinned clips.",
    "url": "https://www.youtube.com/watch?v=smE9CrlCH8k",
    "link": "Video",
    "image": "/assets/projects/iskaarly.webp",
    "alt": "iSkaarly",
    "date": {
      "label": "May 2019",
      "sort": 20190531,
      "source": "Original portfolio year, or public release date where available.",
      "approximate": false
    }
  },
  {
    "name": "League of Legends · Marvel",
    "description": "A Marvel-style title card made with Cinema 4D and the Adobe Suite, following a tutorial.",
    "url": "https://www.youtube.com/watch?v=oJk8Fu7QD_U",
    "link": "Video",
    "image": "/assets/projects/league-of-legends-marvel.webp",
    "alt": "League of Legends · Marvel",
    "date": {
      "label": "March 2019",
      "sort": 20190325,
      "source": "Original portfolio year, or public release date where available.",
      "approximate": false
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
      "sort": 20190101,
      "source": "Original portfolio year, or public release date where available.",
      "approximate": false
    }
  }
];
export const projects = [...projectEntries].sort((a, b) => b.date.sort - a.date.sort);
export function projectSlug(name: string) { return name.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function projectBySlug(slug: string) { return projects.find(project => projectSlug(project.name) === slug); }
export function projectHref(project: { name: string; section?: 'projects' | 'engineering' }) { return project.section === 'engineering' ? `/engineering/${projectSlug(project.name)}` : `/projects/${projectSlug(project.name)}`; }
