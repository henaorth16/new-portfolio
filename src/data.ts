// Everything on the page comes from this file — edit here, not in the components.

export interface SocialLink {
  name: string
  icon: string
  url: string
}

export interface Profile {
  name: string
  role: string
  intro: string
  quote: string
  email: string
  location: string
  cv: string
  summary: string
  education: string
  socials: SocialLink[]
}

export type ProjectCategory = 'fullstack' | 'frontend' | 'interactive'

export interface Project {
  title: string
  icon: string
  blurb: string
  tags: string[]
  url: string
  date?: string
  category: ProjectCategory | ProjectCategory[]
}

export interface Experience {
  role: string
  place: string
  dates: string
  note: string
  technologies?: string[]
}

export interface Highlight {
  value: string
  label: string
  note: string
}

export interface Principle {
  title: string
  description: string
}

export interface EducationDetail {
  degree: string
  institution: string
  location: string
  dates: string
  highlights: string[]
  platforms: string[]
}

export interface Interest {
  label: string
  desc: string
}

export interface Certificate {
  title: string
  issuer: string
  url: string
  date?: string
  credentialId?: string
}

const BASE = import.meta.env.BASE_URL

export const images = {
  background: `${BASE}background.webp`,
  hero: `${BASE}hero-image2.png`,
}

export const profile: Profile = {
  name: 'Henok Emyaye',
  role: 'Full-Stack Web Developer',
  intro:
    'I build modern, fast and responsive web applications with a focus on great user experiences and clean code.',
  quote: 'Better Web Experiences',
  email: 'emyayehenok@gmail.com',
  location: 'Addis Ababa, Ethiopia',
  cv: `${BASE}Henok-Emyaye-CV.pdf`,
  summary:
    'Full-stack developer with 3+ years of hands-on experience building scalable, user-friendly web applications with React, Next.js, Node.js and Python frameworks. I contribute to open-source projects and publish my own developer tools, including an Ethiopian-calendar date picker for React. I care about clean UI, web animation, SEO and performance — and about working well with modern AI tools and agents.',
  education:
    'Microlink Information Technology College, Addis Ababa (2026) — plus plenty of self-teaching with Udemy and freeCodeCamp.',
  // Leave `url` empty to hide an icon.
  socials: [
    { name: 'GitHub', icon: 'github', url: 'https://github.com/henaorth16' },
    { name: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/henok-emyaye-92b199252/' },
    { name: 'X', icon: 'x', url: '' },
    { name: 'Email', icon: 'mail', url: 'mailto:emyayehenok@gmail.com' },
    { name: 'Telegram', icon: 'telegram', url: 'https://t.me/henaorth' },
  ],
}

const GH = 'https://github.com/henaorth16'

export const projects: Project[] = [
  {
    title: 'Debre-Tabor Platform',
    icon: 'church',
    blurb: 'Theological college platform with news, events, content management, and integrated Chapa payment gateway for donations.',
    tags: ['Next.js', 'TypeScript', 'MongoDB', 'Shadcn UI'],
    url: 'https://debre-tabor-portfolio.vercel.app/',
    date: 'Jun 2026',
    category: 'fullstack',
  },
  {
    title: 'Graphity',
    icon: 'gamepad',
    blurb: 'Interactive 3D mathematical equation game helping students strengthen algebra and calculus intuition.',
    tags: ['React.js', 'Three.js', 'Vite', 'TypeScript'],
    url: 'https://graph-ity.vercel.app/',
    date: 'May 2026',
    category: 'interactive',
  },
  {
    title: 'Anágnosi DOCX Viewer',
    icon: 'doc',
    blurb: 'Distraction-free Microsoft office (.docx, .xlsx, .ppt, .rtf) document viewer/reader running in-browser and a browser extension firefox and chrome.',
    tags: ['React', 'Vite', 'WebExtension API'],
    url: 'https://anagnosi.vercel.app/',
    date: 'May 2026',
    category: 'frontend',
  },
  {
    title: 'Ethiopian Bible Web App',
    icon: 'bible',
    blurb: 'Web application for reading, bookmarking, and taking digital notes on the Ethiopian Bible online.',
    tags: ['Next.js', 'Shadcn UI', 'TypeScript'],
    url: 'https://bible.nehemiah-osc.org/',
    date: 'Sep 2025',
    category: 'frontend',
  },
  {
    title: 'Church and Feasts',
    icon: 'church',
    blurb: 'Platform mapping Ethiopian Orthodox Churches and tracking celebration feast schedules with integrated maps.',
    tags: ['Next.js', 'Prisma', 'TypeScript', 'PostgreSQL'],
    url: 'https://church-and-feasts.vercel.app',
    date: 'May 2025',
    category: 'fullstack',
  },
  {
    title: 'Complaint Management',
    icon: 'doc',
    blurb: 'Ticketing and complaint resolution portal with authenticated roles, statuses, and audit tracking.',
    tags: ['Next.js', 'Prisma', 'TypeScript'],
    url: 'https://nextjs-complaint-system.vercel.app/',
    date: 'Jun 2024',
    category: 'fullstack',
  },
  {
    title: 'Ethiopian Date Picker',
    icon: 'calendar',
    blurb: 'React component. lets react developer to add a datepicker in ethiopian date format',
    tags: ['React', 'Tailwind CSS', 'npm'],
    url: `${GH}/ethiopian-calendar-date-picker`,
    date: 'Apr 2024',
    category: 'frontend',
  },
  {
    title: 'Amazing Gear Game',
    icon: 'gamepad',
    blurb: 'HTML5 Canvas 2D physics puzzle game crafted to sharpen algorithmic scripting and canvas rendering.',
    tags: ['JavaScript', 'HTML5 Canvas'],
    url: 'https://amazing-gear.netlify.app/',
    date: 'Dec 2023',
    category: 'interactive',
  },
  {
    title: 'Tour & Travel Agency',
    icon: 'minibus',
    blurb: 'Responsive travel booking website built for clients featuring curated destination catalogs.',
    tags: ['React', 'Tailwind CSS', 'JavaScript'],
    url: 'https://delighttourandtravel.com/',
    date: 'Jul 2023',
    category: 'frontend',
  },
  {
    title: 'Car Rental',
    icon: 'car',
    blurb: 'Booking system with vehicle filtering, management and reservations.',
    tags: ['Express', 'React', 'PostgreSQL'],
    url: 'https://github.com/henaorth16/car-rental-front',
    date: 'Mar 2023',
    category: 'fullstack',
  },
]

export const skills: string[] = [
  'HTML / CSS / JavaScript',
  'TypeScript',
  'React / Next.js',
  'Node.js / Express / NestJS',
  'Python / Django / FastAPI',
  'Git / GitHub',
  'Tailwind CSS',
  'PostgreSQL / Prisma',
]

export const experience: Experience[] = [
  {
    role: 'Front-End Developer',
    place: 'Nehemiah (EOTC) Open Source Community',
    dates: 'Aug 2025 – Present',
    note: 'Frontend for the EOTC Bible web app: API integration, UI and SEO.',
    technologies: ['Next.js', 'Shadcn UI', 'TypeScript', 'SEO'],
  },
  {
    role: 'Full-Stack Developer',
    place: 'Solomon Habeshan Clothes, Addis Ababa',
    dates: 'Mar 2024 – Jul 2024',
    note: 'Faster, responsive Next.js storefront with Chapa payments.',
    technologies: ['Next.js', 'Chapa API', 'Tailwind CSS', 'Responsive UI'],
  },
  {
    role: 'Front-End Developer',
    place: 'Infinite Solutions, Remote',
    dates: 'Jan 2022 – Jun 2023',
    note: 'Responsive React apps, API integrations and performance work.',
    technologies: ['React', 'REST APIs', 'State Management', 'Web Perf'],
  },
]

export const highlights: Highlight[] = [
  {
    value: '3+ Years',
    label: 'Engineering Web Apps',
    note: 'Modern React, Next.js, Node & Python',
  },
  {
    value: '10+ Projects',
    label: 'Shipped & Maintained',
    note: 'From 3D canvas math games to full-stack portals',
  },
  {
    value: 'Open Source',
    label: 'npm Author & Contributor',
    note: 'Published Ethiopian calendar date picker for React',
  },
  {
    value: 'Worldwide',
    label: 'Addis Ababa & Remote',
    note: 'Available for high-impact teams & projects',
  },
]

export const principles: Principle[] = [
  {
    title: 'Performance & Responsiveness First',
    description:
      'Fast software respects the user’s time. I craft lean bundles, smooth animations, and zero-jank responsive interfaces that look great on any device.',
  },
  {
    title: 'Modern & Agentic Engineering',
    description:
      'I stay at the frontier of developer tooling. combining strong TypeScript strictness with AI agents and modern frameworks to ship robust features rapidly.',
  },
  {
    title: 'Cultural & Community Impact',
    description:
      'Passionate about solving localized problems with global software standards. like localized calendar systems, church archives, and regional payment gateways.',
  },
]

export const educationDetails: EducationDetail = {
  degree: 'BSc in Information Technology',
  institution: 'Microlink Information Technology College',
  location: 'Addis Ababa, Ethiopia',
  dates: '2022 – 2026',
  highlights: [
    'Focused on Software Engineering, Data Structures & Algorithms, and Database Architecture.',
    'Led multiple team capstones integrating modern web stacks and regional payments.',
  ],
  platforms: ['freeCodeCamp', 'Udemy', 'MDN Web Docs', 'Open Source Ecosystem'],
}

export const interests: Interest[] = [
  {
    label: 'Traditional Ethiopian Coffee',
    desc: 'Thinking through architecture over fresh buna brews',
  },
  {
    label: 'Math & Canvas Physics',
    desc: 'Simulating mechanical gears, 3D math & interactive canvas games',
  },
  {
    label: 'Scripture & Heritage',
    desc: 'Digitizing and preserving ancient Ge’ez texts and church feast systems',
  },
  {
    label: 'Creative UI & Dev Tools',
    desc: 'Building reusable libraries and experimenting with fresh web aesthetics',
  },
]

export const certificates: Certificate[] = [
  {
    title: 'JavaScript Algorithms and Data Structures',
    issuer: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/certification/henaorth/javascript-algorithms-and-data-structures',
  },
  {
    title: 'Responsive Web Design',
    issuer: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/certification/henaorth/responsive-web-design',
  },
  {
    title: 'C++ Training Crash Course for Beginners',
    issuer: 'Udemy',
    url: 'https://www.udemy.com/certificate/UC-b886a8df-9a76-4030-aa09-49e9c7b0cb28/',
    date: 'Oct 2024',
    credentialId: 'UC-b886a8df-9a76-4030-aa09-49e9c7b0cb28',
  },
  {
    title: 'HTML5 & CSS3 Complete Course: Build Websites like a Pro',
    issuer: 'Udemy',
    url: 'https://www.udemy.com/certificate/UC-8dc2edaf-bff8-4da4-9d1e-5069fec0f2fe/',
    date: 'Dec 2024',
    credentialId: 'UC-8dc2edaf-bff8-4da4-9d1e-5069fec0f2fe',
  },
]
