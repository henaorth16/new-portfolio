import React from 'react'
import { projects } from '../data'
import { ChalkBox, Reveal, Underline } from './Chalk'
import { Icon } from './Icon'

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="relative inline-block font-display font-normal text-[clamp(1.9rem,3vw,2.5rem)] leading-[1.1] mb-[26px] chalky">
      {children}
      <Underline variant={0} />
    </h2>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-[96px]">
      <Reveal>
        <SectionTitle>Featured Projects</SectionTitle>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-[22px]">
        {projects.map((p, i) => (
          <Reveal
            key={p.title}
            delay={(i % 2) * 120 + Math.floor(i / 2) * 80}
            className="flex h-full"
          >
            <ChalkBox
              as="a"
              href={p.url}
              target="_blank"
              rel="noreferrer"
              seed={20 + i * 7}
              className="group relative flex-1 w-full flex items-start gap-4 p-5 pb-[18px] transition-[transform,color] duration-250 ease-out hover:-translate-y-1 hover:-rotate-[0.5deg]"
            >
              <Icon name={p.icon} size={56} className="shrink-0 text-chalk mt-0.5" />
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full gap-2">
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="font-display font-normal text-[1.32rem] leading-[1.2]">{p.title}</h3>
                    {p.date && (
                      <span className="text-[0.82rem] text-chalk-3 font-body shrink-0 tracking-wide">
                        {p.date}
                      </span>
                    )}
                  </div>
                  <p className="text-chalk-2 text-[1rem] leading-[1.35]">{p.blurb}</p>
                </div>

                <ul className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-2 pr-6">
                  {p.tags.map((t) => (
                    <li
                      key={t}
                      className="text-[0.8rem] text-chalk-3 tracking-wide group-hover:text-chalk-2 transition-colors duration-250"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <Icon
                name="arrow"
                size={24}
                className="absolute right-[18px] bottom-3.5 text-chalk-2 transition-all duration-250 group-hover:translate-x-1.5 group-hover:text-yellow"
              />
            </ChalkBox>
          </Reveal>
        ))}
      </div>

    </section>
  )
}
