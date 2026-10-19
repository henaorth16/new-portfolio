import { useEffect, useState } from 'react'
import { images, profile } from './data'
import { useScrollSpy } from './lib/hooks'
import { ChalkDefs, ChalkLine } from './components/Chalk'
import Header from './components/Header'
import Hero from './components/Hero'
import Projects from './components/Projects'
import About from './components/About'
import { Contact, Skills } from './components/Sidebar'
import Loader from './components/Loader'
import ChalkBoardInteractive from './components/ChalkBoardInteractive'

const SECTION_IDS = ['home', 'projects', 'about', 'skills', 'contact']

export default function App() {
  const [active, navigate] = useScrollSpy(SECTION_IDS)
  const [loadingState, setLoadingState] = useState<'loading' | 'fading' | 'loaded'>('loading')

  useEffect(() => {
    let isMounted = true
    const imageList = [images.background, images.hero].filter(Boolean)

    const preloadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image()
        img.src = src
        if (img.complete) {
          resolve()
        } else {
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }
      })

    const imagesPromise = Promise.all(imageList.map(preloadImage))
    const minTimePromise = new Promise((resolve) => setTimeout(resolve, 200))
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500))

    Promise.race([
      Promise.all([imagesPromise, minTimePromise]),
      timeoutPromise,
    ]).then(() => {
      if (isMounted) {
        setLoadingState('fading')
        setTimeout(() => {
          if (isMounted) setLoadingState('loaded')
        }, 300)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <ChalkDefs />

      {/* Board surface: base colour + noise always underneath */}
      <div className="fixed inset-0 z-0 pointer-events-none backdrop-base" aria-hidden="true" />

      {/* Loading overlay: shows only the noise background and animated chalk drawing */}
      {loadingState !== 'loaded' && <Loader fadingOut={loadingState === 'fading'} />}

      {/* Main app content: revealed once all images are preloaded */}
      <div
        className={`transition-opacity duration-300 ${
          loadingState === 'loading' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Photo backdrop + vignette */}
        <div
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${images.background})` }}
          aria-hidden="true"
        />
        <div className="fixed inset-0 z-0 pointer-events-none backdrop-vignette" aria-hidden="true" />


        <ChalkBoardInteractive>
          <div className="relative z-10 max-w-[1290px] mx-auto px-pad pt-3.5 pb-7">
            <Header active={active} onNavigate={navigate} />

            <main>
              <Hero />
              <ChalkLine seed={1} className="my-0" />

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_8px_minmax(240px,0.38fr)] gap-5 md:gap-[clamp(20px,3vw,40px)] px-1.5 pt-6 md:pt-[clamp(24px,4vw,40px)] pb-5">
                <div className="min-w-0">
                  <Projects />
                  <About />
                </div>
                <ChalkLine vertical seed={2} className="hidden lg:block self-stretch" />
                <aside className="flex flex-col gap-8 md:gap-[clamp(30px,4vw,48px)] min-w-0">
                  <Skills />
                  <Contact />
                </aside>
              </div>
            </main>

            <footer className="flex flex-wrap justify-between gap-x-5 gap-y-2 px-1.5 pt-[22px] pb-[26px] text-chalk-3 text-[0.95rem]">
              <span>© {new Date().getFullYear()} {profile.name}</span>
              <span>Drawn in chalk, built with React.</span>
            </footer>
          </div>
        </ChalkBoardInteractive>
      </div>
    </>
  )
}
