import React, { useState } from 'react'
import { profile, skills } from '../data'
import { ChalkBox, Reveal } from './Chalk'
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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sent'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return

    const subject = encodeURIComponent(`Project Idea from ${name.trim()}`)
    const body = encodeURIComponent(
      `Hi Henok,\n\n${message.trim()}\n\n---\nFrom: ${name.trim()}\nEmail: ${email.trim()}`
    )
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
    setStatus('sent')
  }

  return (
    <section id="contact" className="scroll-mt-[96px]">
      <Reveal>
        <SectionTitle>Let’s Work Together</SectionTitle>
      </Reveal>


      {/* ChalkBox-bordered 3 input boxes form */}
      <Reveal delay={120}>
        {/* Direct email and location links */}
      <Reveal as="ul" className="grid gap-2.5  pt-4 border-t mb-4 border-dashed border-chalk-3/30" delay={160}>
        <li className="flex items-center gap-3 min-w-0">
          <Icon name="mail" size={20} className="shrink-0 text-chalk-2" />
          <a
            href={`mailto:${profile.email}`}
            className="break-all text-[0.98rem] border-b border-dashed border-transparent transition-colors duration-200 hover:text-red hover:border-red"
          >
            {profile.email}
          </a>
        </li>
        <li className="flex items-center gap-3 min-w-0">
          <Icon name="pin" size={20} className="shrink-0 text-chalk-2" />
          <span className="break-all text-[0.98rem] text-chalk-2">{profile.location}</span>
        </li>
      </Reveal>
      <Reveal delay={80}>
        <p className="text-chalk-2 text-[1.02rem] mb-4">
          Have an idea or project in mind? Send a message directly to my inbox:
        </p>
      </Reveal>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label htmlFor="contact-name" className="block text-[0.95rem] font-hand text-chalk-3 mb-1">
              Your Name
            </label>
            <ChalkBox seed={21} wobble={2.1} className="bg-board/40 transition-colors focus-within:text-red">
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Henok Emyaye"
                className="w-full bg-transparent px-3.5 py-2 text-chalk placeholder:text-chalk-3/40 font-body text-[1.05rem] focus:outline-none"
              />
            </ChalkBox>
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-[0.95rem] font-hand text-chalk-3 mb-1">
              Your Email
            </label>
            <ChalkBox seed={33} wobble={1.7} className="bg-board/40 transition-colors focus-within:text-red">
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent px-3.5 py-2 text-chalk placeholder:text-chalk-3/40 font-body text-[1.05rem] focus:outline-none"
              />
            </ChalkBox>
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-[0.95rem] font-hand text-chalk-3 mb-1">
              Your Idea / Message
            </label>
            <ChalkBox seed={95} wobble={1.5} className="bg-board/40 transition-colors focus-within:text-red">
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me about what you'd like to build..."
                className="w-full bg-transparent px-3.5 py-2 text-chalk placeholder:text-chalk-3/40 font-body text-[1.05rem] focus:outline-none resize-none"
              />
            </ChalkBox>
          </div>

          <button
            type="submit"
            className="group w-full cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 mt-1"
          >
            <ChalkBox
              as="span"
              seed={47}
              wobble={1.2}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-board/60 text-chalk font-display text-[1.12rem] hover:text-red transition-colors"
            >
              <span>Send </span>
              <Icon name="arrow" size={20} />
            </ChalkBox>
          </button>

          {status === 'sent' && (
            <p className="font-hand text-[1.05rem] text-red mt-1 leading-snug">
              Draft opened in your email app! You can also reach me directly at{' '}
              <a href={`mailto:${profile.email}`} className="underline">
                {profile.email}
              </a>.
            </p>
          )}
        </form>
      </Reveal>

      
    </section>
  )
}
