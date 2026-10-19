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
  },
  {
    role: 'Full-Stack Developer',
    place: 'Solomon Habeshan Clothes, Addis Ababa',
    dates: 'Mar 2024 – Jul 2024',
    note: 'Faster, responsive Next.js storefront with Chapa payments.',
  },
  {
    role: 'Front-End Developer',
    place: 'Infinite Solutions, Remote',
    dates: 'Jan 2022 – Jun 2023',
    note: 'Responsive React apps, API integrations and performance work.',
  },
]
