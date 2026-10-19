import { useState, useEffect, useRef } from 'react'
import { profile } from '../data'
import { ChalkLine, Underline } from './Chalk'
import { Icon } from './Icon'

const links: [string, string][] = [
  ['home', 'Home'],
  ['projects', 'Projects'],
  ['about', 'About'],
  ['skills', 'Skills'],
  ['contact', 'Contact'],
]

export interface HeaderProps {
  active: string
  onNavigate: (id: string) => void
}

export default function Header({ active, onNavigate }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const lastScrollY = useRef(0)

  // Track scroll direction: hide on scroll down, show on scroll up, transparent at top
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY)
          const delta = currentScrollY - lastScrollY.current
          const maxScroll = Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight
          )

          const pastTop = currentScrollY > 20
          setIsScrolled(pastTop)

          if (!pastTop) {
            // Near the top of the page: always visible and transparent
            setIsVisible(true)
          } else if (isOpen) {
            // Mobile menu is open: keep header visible
            setIsVisible(true)
          } else if (Math.abs(delta) > 8) {
            // Scroll down: slide away header (ignore bottom bounce)
            if (delta > 0 && currentScrollY < maxScroll - 20) {
              setIsVisible(false)
            } else if (delta < 0) {
              // Scroll up: slide header back in
              setIsVisible(true)
            }
          }

          lastScrollY.current = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  // Close mobile menu on clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Automatically close mobile menu when resizing to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNavClick = (id: string) => {
    onNavigate(id)
    setIsOpen(false)
  }

  return (
    <>
      {/* Dimmed backdrop when mobile menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-22 md:hidden transition-opacity"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      <header
        ref={headerRef}
        className={`sticky top-0 z-[25] transition-all duration-300 ease-in-out px-2 md:px-4 -mx-2 md:-mx-4 ${!isVisible && !isOpen
            ? '-translate-y-full pointer-events-none'
            : 'translate-y-3 pointer-events-auto'
          } ${isOpen
            ? 'bg-board/95 backdrop-blur-md shadow-xl shadow-black/40 rounded-b-xl pt-3 md:pt-5'
            : isScrolled
              ? 'bg-board/40 backdrop-blur-md shadow-lg shadow-black/30 rounded-b-xl pt-2.5 md:pt-3.5'
              : 'bg-transparent backdrop-blur-none pt-3 md:pt-6'
          }`}
      >
        <div className="flex items-center justify-between gap-x-4 px-1.5 pb-2.5 md:pb-3.5">
          <a
            className="relative font-hand text-[clamp(1.5rem,4.8vw,2.5rem)] font-bold leading-none chalky select-none"
            href="#home"
            onClick={() => handleNavClick('home')}
          >
            {profile.name}
            <Underline variant={2} className="always" />
          </a>

          {/* Desktop Navigation */}
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-x-[clamp(16px,2.6vw,38px)]">
              {links.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={`relative inline-block px-0.5 pt-0.5 pb-1.5 text-[1.2rem] transition-colors duration-200 ${active === id ? 'text-chalk font-semibold' : 'text-chalk-2 hover:text-chalk'
                      }`}
                    aria-current={active === id ? 'true' : undefined}
                    onClick={() => onNavigate(id)}
                  >
                    {label}
                    {active === id && <Underline key={id} variant={1} className="always" />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Hamburger / Close Button */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden relative z-20 flex items-center justify-center w-10 h-10 text-chalk hover:text-red active:scale-95 transition-all cursor-pointer rounded-lg border border-chalk/30 bg-board/60 backdrop-blur-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-red"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            <svg
              className="chalk-icon w-6 h-6 overflow-visible"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {isOpen ? (
                <>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </>
              ) : (
                <>
                  <line x1="3.5" y1="6" x2="20.5" y2="6" />
                  <line x1="3.5" y1="12" x2="20.5" y2="12" />
                  <line x1="3.5" y1="18" x2="20.5" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Drawer Navigation */}
        <div
          id="mobile-navigation"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen
              ? 'max-h-[520px] opacity-100 pb-4'
              : 'max-h-0 opacity-0 pointer-events-none'
            }`}
        >
          <ChalkLine seed={3} className="w-full mb-2 opacity-50" />

          <nav aria-label="Mobile Navigation" className="px-1 pt-1 flex flex-col gap-1">
            <ul className="flex flex-col gap-1">
              {links.map(([id, label], index) => {
                const isActive = active === id
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={() => handleNavClick(id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[1.35rem] font-hand tracking-wide transition-all duration-150 ${isActive
                          ? 'text-chalk bg-chalk/10 font-bold'
                          : 'text-chalk-2 hover:text-chalk hover:bg-chalk/5'
                        }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="relative">
                        {label}
                        {isActive && <Underline variant={index % 3} className="always" />}
                      </span>

                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Chalk Divider inside Drawer */}
          <div className="mt-3 pt-3 border-t border-dashed border-chalk-3/30 flex items-center justify-between gap-3 px-3">
            <a
              href={profile.cv}
              download
              className="inline-flex items-center gap-1.5 text-[1.05rem] font-body text-chalk-2 hover:text-red border-b border-dashed border-chalk-3 pb-0.5 transition-colors"
            >
              <Icon name="download" size={17} />
              <span>Download CV</span>
            </a>
            <div className="flex items-center gap-3">
              {profile.socials
                .filter((s) => s.url)
                .map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    aria-label={s.name}
                    target={s.url.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="text-chalk-2 hover:text-red transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Icon name={s.icon} size={22} />
                  </a>
                ))}
            </div>
          </div>
        </div>

        <ChalkLine seed={0} className="w-full my-0" />
      </header>
    </>
  )
}
