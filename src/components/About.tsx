import { useEffect, useRef } from 'react'
import { experience, profile } from '../data'
import { ChalkBox, Reveal } from './Chalk'
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
    <section id="about" className="mt-10 md:mt-[clamp(40px,6vw,64px)] scroll-mt-[96px]">
      <Reveal>
        <SectionTitle>About Me</SectionTitle>
      </Reveal>
      <Reveal delay={100}>
        <p className="max-w-[62ch] text-chalk-2 text-[1.12rem]">{profile.summary}</p>
      </Reveal>

      <Reveal delay={150} className="my-7">
        <ChalkBox seed={19} wobble={1.3} className="overflow-hidden max-w-[620px] rounded-lg bg-board/10">
          <video
            ref={videoRef}
            src={`${import.meta.env.BASE_URL}draw-hero.webm`}
            muted
            playsInline
            preload="none"
            className="w-full h-auto block aspect-video object-cover mix-blend-screen"
          />
        </ChalkBox>
      </Reveal>

      <ol className="relative my-7 mr-0 ml-2.5 pl-7 border-l-2 border-dashed border-chalk-3 grid gap-6">
        {experience.map((e, i) => (
          <Reveal
            as="li"
            key={e.role + e.place}
            delay={i * 90}
            className="relative before:content-[''] before:absolute before:-left-[37px] before:top-[0.45em] before:w-3.5 before:h-3.5 before:border-2 before:border-chalk before:rounded-[55%_45%_50%_50%/50%_55%_45%_50%] before:bg-board"
          >
            <div>
              <strong className="font-display font-normal text-[1.2rem]">{e.role}</strong>
              <span className="text-chalk-2"> · {e.place}</span>
            </div>
            <div className="font-hand text-[1.3rem] text-red leading-[1.1]">{e.dates}</div>
            <p className="text-chalk-2 text-[1.02rem] mt-0.5">{e.note}</p>
          </Reveal>
        ))}
      </ol>
      <Reveal>
        <p className="mt-[26px] text-chalk-3 text-[1rem]">{profile.education}</p>
      </Reveal>
    </section>
  )
}
