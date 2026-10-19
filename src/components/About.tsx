import { useEffect, useRef } from 'react'
import {
  certificates,
  educationDetails,
  experience,
  highlights,
  interests,
  principles,
  profile,
} from '../data'
import { ChalkBox, Reveal, Underline } from './Chalk'
import GitHubContributions from './GitHubContributions'
import { Icon } from './Icon'
import { SectionTitle } from './Projects'

export default function About() {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.ended) {
            video.play().catch(() => {
              // Handle browser autoplay policy gracefully
            })
          }
        } else {
          video.pause()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="mt-4 scroll-mt-[96px]">
      <Reveal>
        <SectionTitle>About Me</SectionTitle>
      </Reveal>

      {/* Top Section: Bio Summary on left, Chalk Drawing Video on right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start my-6">
        <Reveal delay={80}>
          <p className="text-chalk-2 text-[1.15rem] leading-relaxed">
            {profile.summary}
          </p>
        </Reveal>

        <Reveal delay={150}>
          <ChalkBox seed={19} wobble={1.3} className="overflow-hidden rounded-lg bg-board/10">
            <video
              ref={videoRef}
              src={`${import.meta.env.BASE_URL}draw-hero.webm`}
              muted
              playsInline
              preload="none"
              className="w-full h-auto block aspect-video object-cover mix-blend-screen"
            />
          </ChalkBox>
          <p className="font-hand text-[1.05rem] text-chalk-3 mt-2 tracking-wide text-center lg:text-left">
            Figure 2: From hand-drawn board ideas to high-performance code.
          </p>
        </Reveal>
      </div>

      {/* Quick stats / Highlights grid - 4 columns on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 my-7">
        {highlights.map((h, i) => (
          <Reveal key={h.label} delay={100 + i * 60} className="flex h-full">
            <ChalkBox
              seed={30 + i * 5}
              wobble={1.2}
              className="p-4 flex flex-col justify-between w-full h-full bg-board/20 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="mb-1.5">
                <span className="font-display font-semibold text-[1.38rem] leading-tight text-chalk">
                  {h.value}
                </span>
              </div>
              <div>
                <p className="font-hand text-[1.18rem] leading-[1.15] text-chalk-2">
                  {h.label}
                </p>
                <p className="text-[0.85rem] text-chalk-3 mt-1 leading-snug">
                  {h.note}
                </p>
              </div>
            </ChalkBox>
          </Reveal>
        ))}
      </div>

      {/* Core Engineering Principles - 3 columns */}
      <Reveal delay={100} className="mt-10">
        <h3 className="relative inline-block font-display text-[1.5rem] chalky text-chalk mb-4">
          <span>How I Build & Work</span>
          <Underline variant={1} className="always" />
        </h3>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-9">
        {principles.map((p, idx) => (
          <Reveal key={p.title} delay={120 + idx * 70} className="flex h-full">
            <ChalkBox
              seed={50 + idx * 7}
              wobble={1.1}
              className="p-4 sm:p-5 flex flex-col justify-between w-full h-full bg-board/15 transition-transform duration-200 hover:-translate-y-1"
            >
              <div>
                <h4 className="font-display font-medium text-[1.2rem] leading-tight text-chalk mb-2">
                  {p.title}
                </h4>
                <p className="text-chalk-2 text-[0.98rem] leading-[1.42]">
                  {p.description}
                </p>
              </div>
            </ChalkBox>
          </Reveal>
        ))}
      </div>

      {/* Experience Timeline */}
      <Reveal delay={80}>
        <h3 className="relative inline-block font-display text-[1.5rem] chalky text-chalk mt-4 mb-5">
          <span>Work Experience</span>
          <Underline variant={2} className="always" />
        </h3>
      </Reveal>

      <ol className="relative my-4 mr-0 ml-2.5 pl-7 border-l-2 border-dashed border-chalk-3 grid gap-7">
        {experience.map((e, i) => (
          <Reveal
            as="li"
            key={e.role + e.place}
            delay={i * 90}
            className="relative before:content-[''] before:absolute before:-left-[37px] before:top-[0.45em] before:w-3.5 before:h-3.5 before:border-2 before:border-chalk before:rounded-[55%_45%_50%_50%/50%_55%_45%_50%] before:bg-board"
          >
            <div>
              <strong className="font-display font-normal text-[1.25rem]">{e.role}</strong>
              <span className="text-chalk-2"> · {e.place}</span>
            </div>
            <div className="font-hand text-[1.32rem] text-red leading-[1.1]">{e.dates}</div>
            <p className="text-chalk-2 text-[1.04rem] mt-1 max-w-[75ch]">{e.note}</p>
            {e.technologies && (
              <ul className="flex flex-wrap items-center gap-2 mt-2.5" aria-label="Technologies used">
                {e.technologies.map((t) => (
                  <li
                    key={t}
                    className="px-2.5 py-0.5 rounded text-[0.82rem] font-body text-chalk-2 border border-chalk-3/40 bg-board/40"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        ))}
      </ol>

      {/* Education & Learning */}
      <Reveal delay={120} className="mt-10">
        <h3 className="relative inline-block font-display text-[1.45rem] chalky text-chalk mb-4">
          <span>Education</span>
          <Underline variant={0} className="always" />
        </h3>

        <ChalkBox seed={77} wobble={1.2} className="p-5 sm:p-6 bg-board/20">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
            <div>
              <strong className="font-display font-normal text-[1.28rem] text-chalk">
                {educationDetails.degree}
              </strong>
              <div className="text-chalk-2 text-[1.05rem]">
                {educationDetails.institution} · {educationDetails.location}
              </div>
            </div>
            <span className="font-hand text-[1.25rem] text-red shrink-0">
              {educationDetails.dates}
            </span>
          </div>

          <div className="mt-4 pt-3.5 border-t border-dashed border-chalk-3/30">
            <span className="font-hand text-[1.12rem] text-chalk-2 block mb-2">
              Certificates:
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[0.96rem]">
              {certificates.map((cert) => (
                <li key={cert.title}>
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-baseline gap-1.5 text-chalk-2 hover:text-red transition-colors group"
                  >
                    <span className="text-chalk-3 group-hover:text-red leading-none">•</span>
                    <span className="border-b border-dashed border-chalk-3/40 group-hover:border-red">
                      {cert.title}
                    </span>
                    <span className="text-chalk-3 text-[0.84rem]">
                      ({cert.issuer})
                    </span>
                    <span className="text-[0.75rem] text-chalk-3 group-hover:text-red">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </ChalkBox>
      </Reveal>

      {/* Beyond the Terminal / Interests - 4 columns on large screens */}
      <Reveal delay={120} className="mt-11">
        <h3 className="relative inline-block font-display text-[1.5rem] chalky text-chalk mb-3">
          <span>Beyond The Code</span>
          <Underline variant={1} className="always" />
        </h3>
        <p className="text-chalk-2 text-[1.05rem] mb-4">
          When I’m away from the keyboard, here are a few things that inspire my creativity and keep me curious:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {interests.map((item, idx) => (
            <ChalkBox
              key={item.label}
              seed={85 + idx * 6}
              wobble={1.1}
              className="p-4 flex flex-col justify-between bg-board/15 transition-transform duration-200 hover:-translate-y-1"
            >
              <div>
                <strong className="font-display font-medium text-[1.18rem] text-chalk block leading-tight mb-1">
                  {item.label}
                </strong>
                <span className="text-chalk-3 text-[0.94rem] block leading-snug">
                  {item.desc}
                </span>
              </div>
            </ChalkBox>
          ))}
        </div>
      </Reveal>

      {/* GitHub Contributions Graph */}
      <GitHubContributions />

      {/* Call to action note */}
      <Reveal delay={140} className="mt-9">
        <ChalkBox seed={99} wobble={1.2} className="p-4 sm:p-5 bg-board/30 text-center flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-hand text-[1.28rem] text-chalk text-center sm:text-left">
            Open for full-stack engineering roles, freelance builds & open-source collaboration.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 font-display text-[1.08rem] text-red hover:underline shrink-0"
          >
            <span>Let’s connect</span>
            <Icon name="arrow" size={18} />
          </a>
        </ChalkBox>
      </Reveal>
    </section>
  )
}
