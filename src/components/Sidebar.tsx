import { profile, skills } from '../data'
import { Reveal } from './Chalk'
import { Icon } from './Icon'
import { SectionTitle } from './Projects'

export function Skills() {
  return (
    <section id="skills" className="scroll-mt-[96px]">
      <Reveal>
        <SectionTitle>Skills</SectionTitle>
      </Reveal>
      <ul className="grid gap-2">
        {skills.map((s, i) => (
          <Reveal as="li" key={s} delay={i * 60} className="flex items-center gap-3.5 text-[1.1rem]">
            <Icon name="check" size={24} className="shrink-0 text-chalk-2" />
            <span>{s}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-[96px]">
      <Reveal>
        <SectionTitle>Let’s Work Together</SectionTitle>
      </Reveal>
      <Reveal as="ul" className="grid gap-3" delay={120}>
        <li className="flex items-center gap-3.5 min-w-0">
          <Icon name="mail" size={24} className="shrink-0 text-chalk-2" />
          <a
            href={`mailto:${profile.email}`}
            className="break-all border-b-2 border-dashed border-transparent transition-colors duration-200 hover:text-red hover:border-red"
          >
            {profile.email}
          </a>
        </li>
        <li className="flex items-center gap-3.5 min-w-0">
          <Icon name="pin" size={24} className="shrink-0 text-chalk-2" />
          <span className="break-all">{profile.location}</span>
        </li>
      </Reveal>
    </section>
  )
}
