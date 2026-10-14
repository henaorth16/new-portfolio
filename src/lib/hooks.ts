import { useEffect, useRef, useState } from 'react'

/** Highlights the nav item for the section currently crossing the middle of the screen. */
export function useScrollSpy(ids: string[]): [string, (id: string) => void] {
  const [active, setActive] = useState<string>(ids[0])
  const lockUntil = useRef<number>(0)
  const key = ids.join('|')

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntil.current) return
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[visible.length - 1].target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // After a nav click, ignore the spy briefly so the clicked item doesn't flicker.
  const choose = (id: string) => {
    lockUntil.current = Date.now() + 900
    setActive(id)
  }

  return [active, choose]
}
