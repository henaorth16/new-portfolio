import React, { useLayoutEffect, useMemo, useRef, useState, useEffect } from 'react'
import { roughRectPath } from '../lib/rough'

/** Hidden SVG filters that turn crisp vector strokes into grainy chalk. */
export function ChalkDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        {/* Strokes: wobble the edge, then knock out tiny specks so it looks dusty. */}
        <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.2" result="wobbly" />
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="8" result="grain" />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -0.75"
            result="speckle"
          />
          <feComposite in="wobbly" in2="speckle" operator="in" />
        </filter>
        {/* Text: much gentler, so handwriting stays readable. */}
        <filter id="chalk-soft" x="-2%" y="-10%" width="104%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="5" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="1.6" result="wobbly" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="grain" />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -0.45"
            result="speckle"
          />
          <feComposite in="wobbly" in2="speckle" operator="in" />
        </filter>
      </defs>
    </svg>
  )
}

export interface ChalkBorderProps {
  seed?: number
  wobble?: number
  className?: string
}

/** A hand-drawn box that sizes itself to its (positioned) parent. */
export function ChalkBorder({ seed = 1, wobble = 1.4, className = '' }: ChalkBorderProps) {
  const ref = useRef<SVGSVGElement | null>(null)
  const [s, setS] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return
    const measure = () => setS({ w: parent.offsetWidth, h: parent.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  const d1 = useMemo(() => roughRectPath(s.w, s.h, seed, { wobble }), [s, seed, wobble])
  const d2 = useMemo(() => roughRectPath(s.w, s.h, seed + 101, { wobble: wobble * 1.3 }), [s, seed, wobble])

  return (
    <svg
      ref={ref}
      className={`chalk-border absolute inset-0 overflow-visible pointer-events-none fill-none stroke-current stroke-[2.2] [stroke-linecap:round] ${className}`}
      width={s.w}
      height={s.h}
      viewBox={`0 0 ${s.w} ${s.h}`}
      aria-hidden="true"
    >
      <path d={d1} />
      <path d={d2} className="faint stroke-[1.1] opacity-50" />
    </svg>
  )
}

export type ChalkBoxProps<T extends React.ElementType = 'div'> = {
  as?: T
  seed?: number
  wobble?: number
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'seed' | 'wobble' | 'className' | 'children'>

/** Wrapper that gives any block a chalk outline. */
export function ChalkBox<T extends React.ElementType = 'div'>({
  as,
  seed = 1,
  wobble,
  className = '',
  children,
  ...rest
}: ChalkBoxProps<T>) {
  const Tag = (as || 'div') as React.ElementType
  return (
    <Tag className={`chalk-box relative text-chalk overflow-hidden ${className}`} {...rest}>
      <ChalkBorder seed={seed} wobble={wobble} />
      {children}
    </Tag>
  )
}

export interface ChalkLineProps {
  vertical?: boolean
  seed?: number
  className?: string
}

/** A long chalk stroke used as a divider. */
export function ChalkLine({ vertical = false, seed = 0, className = '' }: ChalkLineProps) {
  const paths = [
    'M0 4 Q250 1.5 500 4.5 T1000 3.5',
    'M0 3.5 Q200 6 480 3 T1000 4.5',
  ]
  const d = paths[seed % paths.length]
  return (
    <svg
      className={`chalk-line block fill-none stroke-chalk-2 stroke-2 [stroke-linecap:round] overflow-visible ${
        vertical ? 'w-2 h-auto self-stretch [transform-box:fill-box]' : 'w-full h-2'
      } ${className}`}
      viewBox="0 0 1000 8"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={d} vectorEffect="non-scaling-stroke" />
      <path d={paths[(seed + 1) % paths.length]} vectorEffect="non-scaling-stroke" className="faint stroke-[1] opacity-45" />
    </svg>
  )
}

export interface UnderlineProps {
  variant?: number
  className?: string
}

/** A hand-drawn swoosh that "writes itself" under a word. */
export function Underline({ variant = 0, className = '' }: UnderlineProps) {
  const d = [
    'M3 8 C 40 3, 85 12, 130 6 S 185 4, 197 8',
    'M2 6 C 50 10, 70 2, 120 7 S 170 11, 198 5',
    'M4 7 Q 60 2 110 7 T 196 6',
  ][variant % 3]
  return (
    <svg
      className={`underline-svg absolute -left-[2%] -bottom-[0.28em] w-[104%] h-[0.38em] overflow-visible fill-none stroke-current stroke-[2.4] [stroke-linecap:round] pointer-events-none ${className}`}
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="draw" d={d} pathLength="1" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export type RevealProps<T extends React.ElementType = 'div'> = {
  as?: T
  delay?: number
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'delay' | 'className' | 'children'>

/** Fades/slides children in the first time they scroll into view. */
export function Reveal<T extends React.ElementType = 'div'>({
  as,
  delay = 0,
  className = '',
  children,
  style,
  ...rest
}: RevealProps<T>) {
  const Tag = (as || 'div') as React.ElementType
  const ref = useRef<HTMLElement | null>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${seen ? 'is-visible' : ''} ${className}`}
      style={{ ...(style as object), ['--d' as string]: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
