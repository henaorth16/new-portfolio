
import { images, profile } from '../data'
import { ChalkBox, Reveal } from './Chalk'
import { Icon } from './Icon'

export default function Hero() {
  const socials = profile.socials.filter((s) => s.url)

  return (
    <section id="home" className="hero grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.15fr_0.95fr_0.8fr] items-center gap-6 px-1.5 pt-[clamp(28px,2vw,56px)] pb-[clamp(24px,4vw,44px)] scroll-mt-[90px] text-left">
      <Reveal className="hero-text col-span-1 md:col-span-2 lg:col-span-1">
        <p className="font-display text-[clamp(1.4rem,2vw,1.8rem)] text-chalk-2">Hello, I’m</p>
        <h1 className="font-display font-normal text-8xl leading-none my-1 chalky">{profile.name}</h1>
        <p className="font-display text-[clamp(1.3rem,2vw,1.75rem)] text-chalk-2 mb-3.5">{profile.role}</p>
        <p className="max-w-[30ch] text-chalk text-[1.15rem]">{profile.intro}</p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 mt-[26px]">
          <a className="group inline-block" href="#projects">
            <ChalkBox as="span" seed={11} className="inline-flex items-center gap-2.5 py-[11px] px-[26px] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:-rotate-[0.8deg]">
              View Projects <Icon name="arrow" size={22} />
            </ChalkBox>
          </a>
          <a className="inline-flex items-center gap-2 text-[1.05rem] border-b-2 border-dashed border-chalk-3 pb-0.5 transition-colors duration-200 hover:text-yellow hover:border-yellow" href={profile.cv} download>
            Download CV <Icon name="download" size={20} />
          </a>
        </div>
      </Reveal>

      <Reveal className="hero-portrait flex justify-center order-2 lg:order-none" delay={150}>
        <div
          className="hero-svg-wrapper min-h-[320px]"
          // dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
        <img src={images.hero} alt="alt"  />
      </Reveal>

      <Reveal className="hero-side flex flex-col md:flex-row lg:flex-col items-center justify-between lg:justify-start flex-wrap gap-[38px] order-3 lg:order-none" delay={300}>
        <blockquote className="quote relative -rotate-[4deg] lg:-rotate-[6deg] text-center">
          <span className="quote-text block max-w-[7ch] mx-auto font-hand font-bold text-[clamp(2.2rem,3.6vw,3.2rem)] leading-[1.02] text-chalk text-shadow-[0_0_1px_rgba(255,255,255,0.5)]">
            “{profile.quote}”
          </span>
          <svg className="quote-swoosh chalk-art block w-[78%] mx-auto mt-2 text-chalk-2" viewBox="0 0 220 24" fill="none" aria-hidden="true">
            <path className="draw" d="M6 16 C 60 6, 120 14, 214 4" pathLength="1" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </blockquote>
        <ul className="socials flex gap-[22px]" aria-label="Social links">
          {socials.map((s) => (
            <li key={s.name}>
              <a
                href={s.url}
                aria-label={s.name}
                target={s.url.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="block text-chalk-2 transition-all duration-200 hover:text-yellow hover:-translate-y-[3px] hover:-rotate-[5deg]"
              >
                <Icon name={s.icon} size={38} />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
