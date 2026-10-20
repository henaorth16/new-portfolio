import React, { useEffect, useMemo, useRef, useState } from 'react'
import initialData from '../data/contributions.json'
import { ChalkBox, Reveal, Underline } from './Chalk'

interface DayContribution {
  date: string
  count: number
  level: number
}

interface ContributionsData {
  total: {
    lastYear: number
    [key: string]: number
  }
  contributions: DayContribution[]
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = [
  { day: 1, label: 'Mon' },
  { day: 3, label: 'Wed' },
  { day: 5, label: 'Fri' },
]

// Chalk shading for contribution levels
const LEVEL_STYLES: Record<number, { fill: string; stroke: string }> = {
  0: { fill: 'rgba(29, 31, 30, 0.45)', stroke: 'rgba(242, 240, 232, 0.16)' },
  1: { fill: 'rgba(223, 221, 214, 0.22)', stroke: 'rgba(223, 221, 214, 0.38)' },
  2: { fill: 'rgba(223, 221, 214, 0.46)', stroke: 'rgba(223, 221, 214, 0.68)' },
  3: { fill: 'rgba(223, 221, 214, 0.74)', stroke: 'rgba(223, 221, 214, 0.92)' },
  4: { fill: '#ffffff', stroke: '#ffffff' },
}

const CELL_SIZE = 11
const GAP = 3
const PITCH = CELL_SIZE + GAP // 14px
const LEFT_PAD = 32
const TOP_PAD = 22

export default function GitHubContributions() {
  const [data, setData] = useState<ContributionsData>(initialData as ContributionsData)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    text: string
  }>({ visible: false, x: 0, y: 0, text: '' })

  const cardRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Fetch live contributions asynchronously; fallback to cached data seamlessly
  useEffect(() => {
    let isMounted = true
    fetch('https://github-contributions-api.jogruber.de/v4/henaorth16?y=last')
      .then((res) => {
        if (!res.ok) throw new Error('Network error')
        return res.json()
      })
      .then((live) => {
        if (isMounted && live?.contributions?.length) {
          setData(live)
        }
      })
      .catch(() => {
        // Keep initial fallback cached data
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Group days into 53 weeks (columns)
  const { weeks, monthLabels } = useMemo(() => {
    const list = data.contributions || []
    const weekCols: DayContribution[][] = []
    let currentWeek: DayContribution[] = []

    list.forEach((day) => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weekCols.push(currentWeek)
        currentWeek = []
      }
    })
    if (currentWeek.length > 0) {
      weekCols.push(currentWeek)
    }

    // Determine month label positions along columns
    const labels: { colIndex: number; name: string }[] = []
    let lastMonth = -1

    weekCols.forEach((col, idx) => {
      if (!col[0]) return
      const dateParts = col[0].date.split('-')
      const m = parseInt(dateParts[1], 10) - 1
      if (m !== lastMonth) {
        labels.push({ colIndex: idx, name: MONTH_NAMES[m] })
        lastMonth = m
      }
    })

    return { weeks: weekCols, monthLabels: labels }
  }, [data])

  // Scroll to show latest activity on mobile devices
  useEffect(() => {
    if (scrollRef.current && window.innerWidth < 768) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [weeks])

  const totalContributions = data.total?.lastYear ?? 603

  const handleMouseEnter = (day: DayContribution, e: React.MouseEvent<SVGRectElement>) => {
    if (!cardRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const cardRect = cardRef.current.getBoundingClientRect()

    const countText = day.count === 1 ? '1 contribution' : `${day.count} contributions`
    const dateObj = new Date(day.date + 'T00:00:00')
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    setTooltip({
      visible: true,
      x: rect.left - cardRect.left + rect.width / 2,
      y: rect.top - cardRect.top - 8,
      text: `${countText} on ${formattedDate}`,
    })
  }

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }))
  }

  const svgWidth = LEFT_PAD + weeks.length * PITCH + 8
  const svgHeight = TOP_PAD + 7 * PITCH + 6

  return (
    <Reveal delay={120} className="mt-11 w-full max-w-full overflow-hidden">
      {/* Header outside the scroll container: stays firmly in place */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4 w-full">
        <div>
          <h3 className="relative inline-block font-display text-[1.45rem] chalky text-chalk">
            <span>GitHub Contributions</span>
            <Underline variant={2} className="always" />
          </h3>
          <p className="text-chalk-3 text-[0.95rem] mt-0.5">
            Year in code ·{' '}
            <a
              href="https://github.com/henaorth16"
              target="_blank"
              rel="noreferrer"
              className="text-chalk-2 hover:text-red transition-colors underline decoration-dashed underline-offset-4"
            >
              @henaorth16
            </a>
          </p>
        </div>
        <div className="font-hand text-[1.25rem] text-red shrink-0">
          {totalContributions.toLocaleString()} contributions in the last year
        </div>
      </div>

      {/* ChalkBox container: stays fixed at 100% width, no page-level overflow */}
      <div ref={cardRef} className="relative w-full max-w-full">
        <ChalkBox seed={12} wobble={3.15} className="w-full max-w-full p-3 sm:p-5 bg-board/20 relative overflow-hidden">
          {/* Mobile scroll hint */}
          <div className="flex items-center justify-between sm:hidden pb-1 text-[0.82rem] font-hand text-chalk-3">
            <span>← Swipe horizontally for full year</span>
            <span>Latest →</span>
          </div>

          {/* Horizontally scrollable grid container: ONLY this element scrolls on mobile */}
          <div
            ref={scrollRef}
            className="w-full max-w-full overflow-x-auto overscroll-x-contain pb-2 pt-1 touch-pan-x [scrollbar-width:thin] [scrollbar-color:rgba(223,221,214,0.25)_transparent]"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onScroll={() => setTooltip((prev) => ({ ...prev, visible: false }))}
          >
            <svg
              className="block text-chalk overflow-visible select-none"
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ minWidth: `${svgWidth}px` }}
              aria-label="GitHub contribution chart for henaorth16"
            >
              {/* Hand-drawn chalk grid coordinate guidelines */}
              <g aria-hidden="true">
                {/* Horizontal chalk grid lines across the 7 rows */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line
                    key={`h-line-${i}`}
                    x1={LEFT_PAD - 4}
                    y1={TOP_PAD + i * PITCH - 1.5}
                    x2={LEFT_PAD + weeks.length * PITCH + 2}
                    y2={TOP_PAD + i * PITCH - 1.5}
                    stroke="rgba(242, 240, 232, 0.12)"
                    strokeDasharray="2, 4"
                    strokeWidth="1"
                  />
                ))}

                {/* Vertical chalk month dividers */}
                {monthLabels.map(({ colIndex }) => (
                  <line
                    key={`v-line-${colIndex}`}
                    x1={LEFT_PAD + colIndex * PITCH - 1.5}
                    y1={TOP_PAD - 4}
                    x2={LEFT_PAD + colIndex * PITCH - 1.5}
                    y2={TOP_PAD + 7 * PITCH}
                    stroke="rgba(242, 240, 232, 0.16)"
                    strokeDasharray="3, 3"
                    strokeWidth="1"
                  />
                ))}
              </g>

              {/* Month text headers */}
              {monthLabels.map(({ colIndex, name }) => (
                <text
                  key={`m-text-${colIndex}`}
                  x={LEFT_PAD + colIndex * PITCH}
                  y={TOP_PAD - 8}
                  className="fill-current text-chalk-2 font-hand text-[12px]"
                >
                  {name}
                </text>
              ))}

              {/* Day of week labels */}
              {DAY_LABELS.map(({ day, label }) => (
                <text
                  key={`d-text-${day}`}
                  x={LEFT_PAD - 8}
                  y={TOP_PAD + day * PITCH + CELL_SIZE - 2}
                  textAnchor="end"
                  className="fill-current text-chalk-3 font-hand text-[11px]"
                >
                  {label}
                </text>
              ))}

              {/* Contribution Chalk Cells */}
              <g filter="url(#chalk)">
                {weeks.map((week, wIdx) =>
                  week.map((day, dIdx) => {
                    const style = LEVEL_STYLES[day.level] || LEVEL_STYLES[0]
                    return (
                      <rect
                        key={day.date}
                        x={LEFT_PAD + wIdx * PITCH}
                        y={TOP_PAD + dIdx * PITCH}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        rx={2}
                        className="cursor-pointer transition-transform duration-100 hover:stroke-[#ddd]"
                        fill={style.fill}
                        stroke={style.stroke}
                        strokeWidth="1.2"
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={handleMouseLeave}
                      />
                    )
                  })
                )}
              </g>
            </svg>
          </div>

          {/* Floating chalkboard tooltip */}
          {tooltip.visible && (
            <div
              className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded bg-board/95 border border-dashed border-chalk text-[0.88rem] font-hand text-chalk shadow-lg whitespace-nowrap"
              style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
            >
              {tooltip.text}
            </div>
          )}

          {/* Legend: stays in place */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-3 mt-2 border-t border-dashed border-chalk-3/30 text-[0.88rem] text-chalk-3 font-hand w-full">
            <span>Figure 3:  Drawn daily from git commits</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((lvl) => {
                  const style = LEVEL_STYLES[lvl]
                  return (
                    <span
                      key={`legend-${lvl}`}
                      className="inline-block w-2.5 h-2.5 rounded-[2px]"
                      style={{
                        backgroundColor: style.fill,
                        border: `1.2px solid ${style.stroke}`,
                      }}
                    />
                  )
                })}
              </div>
              <span>More</span>
            </div>
          </div>
        </ChalkBox>
      </div>
    </Reveal>
  )
}
