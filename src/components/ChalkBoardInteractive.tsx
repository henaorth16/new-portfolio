import React, { useState, useEffect, useRef, useCallback } from 'react'

export type ToolType = 'browse' | 'chalk' | 'eraser'

interface Point {
  x: number
  y: number
}

interface Action {
  id: string
  type: 'chalk' | 'eraser'
  points: Point[]
  color: string
  width: number
  d: string
}

interface EraseStroke {
  id: string
  d: string
  width: number
}

const CHALK_COLORS = [
  { name: 'White', value: '#f2f0e8' },
  { name: 'Warm Yellow', value: '#f38a8a' },
  { name: 'Sky Chalk', value: '#93c5fd' },
]

function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} l 0.1 0.1`
  }
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  for (let i = 1; i < points.length - 1; i++) {
    const xc = ((points[i].x + points[i + 1].x) / 2).toFixed(1)
    const yc = ((points[i].y + points[i + 1].y) / 2).toFixed(1)
    d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}, ${xc} ${yc}`
  }
  const last = points[points.length - 1]
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`
  return d
}

function drawStrokeOnCtx(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  width: number,
  isEraser: boolean
) {
  if (points.length === 0) return
  ctx.save()

  if (isEraser) {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  } else {
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = color
    ctx.shadowBlur = 2.5
  }

  if (points.length === 1) {
    ctx.beginPath()
    ctx.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2)
    ctx.fillStyle = isEraser ? 'rgba(0,0,0,1)' : color
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
    }
    const last = points[points.length - 1]
    ctx.lineTo(last.x, last.y)
    ctx.stroke()
  }

  // Faint chalk dust trace for realistic blackboard eraser smudge
  if (isEraser) {
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = 'rgba(242, 240, 232, 0.035)'
    ctx.lineWidth = width * 0.85
    ctx.stroke()
  }

  ctx.restore()
}

const getChalkCursor = (colorHex: string) => {
  const encodedColor = encodeURIComponent(colorHex)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g transform="rotate(-35 6 26)"><rect x="3" y="4" width="7" height="24" rx="2" fill="${encodedColor}" stroke="%23222" stroke-width="0.8" /><line x1="3" y1="8" x2="10" y2="8" stroke="%23555" stroke-width="0.6" stroke-dasharray="1 1" /></g></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 4 28, crosshair`
}

const getEraserCursor = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="30" viewBox="0 0 36 30"><rect x="2" y="2" width="32" height="11" rx="3" fill="%23854d0e" stroke="%23451a03" stroke-width="1.2"/><rect x="2" y="13" width="32" height="13" rx="2" fill="%233f3f46" stroke="%2318181b" stroke-width="1"/><line x1="4" y1="24" x2="32" y2="24" stroke="%23f2f0e8" stroke-width="0.8" opacity="0.6" stroke-dasharray="2 2"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 18 15, cell`
}

interface ChalkBoardInteractiveProps {
  children: React.ReactNode
}

export default function ChalkBoardInteractive({ children }: ChalkBoardInteractiveProps) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [tool, setTool] = useState<ToolType>('browse')
  const [chalkColor, setChalkColor] = useState(CHALK_COLORS[0].value)

  // Actions history for chronological drawing/erasing/undo
  const [actions, setActions] = useState<Action[]>([])
  const actionsRef = useRef<Action[]>([])
  actionsRef.current = actions

  // Erase strokes for the DOM mask (punching holes through DOM text/cards)
  const [eraseStrokes, setEraseStrokes] = useState<EraseStroke[]>([])
  const [activeEraserD, setActiveEraserD] = useState('')

  const isDrawingRef = useRef(false)
  const currentPointsRef = useRef<Point[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [dimensions, setDimensions] = useState({ w: 1200, h: 2000 })

  // Desktop detection
  useEffect(() => {
    const checkDesktop = () => {
      const match = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches
      setIsDesktop(match)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Redraw all actions chronologically onto the 2D canvas
  const redrawCanvas = useCallback((actionsList: Action[]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr, dpr)

    for (const act of actionsList) {
      drawStrokeOnCtx(ctx, act.points, act.color, act.width, act.type === 'eraser')
    }
    ctx.restore()
  }, [])

  // Keep dimensions synced with full page height & width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const scrollH = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        el.scrollHeight,
        el.offsetHeight
      )
      const w = el.offsetWidth || window.innerWidth
      setDimensions({ w, h: scrollH })

      const canvas = canvasRef.current
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.floor(w * dpr)
        canvas.height = Math.floor(scrollH * dpr)
        canvas.style.width = `${w}px`
        canvas.style.height = `${scrollH}px`
        redrawCanvas(actionsRef.current)
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [redrawCanvas])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isDesktop) return
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      if (e.key === 'c' || e.key === 'C') {
        if (!e.ctrlKey && !e.metaKey) setTool('chalk')
      } else if (e.key === 'e' || e.key === 'E') {
        setTool('eraser')
      } else if (e.key === 'Escape' || e.key === 'v' || e.key === 'V') {
        setTool('browse')
      } else if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDesktop])

  const getCoordinates = (e: React.PointerEvent): Point => {
    if (!containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tool === 'browse') return
    if (e.button !== 0) return
    e.preventDefault()
    try {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    } catch {}

    isDrawingRef.current = true
    const pt = getCoordinates(e)
    currentPointsRef.current = [pt]

    // Draw single point directly to canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        ctx.save()
        ctx.scale(dpr, dpr)
        drawStrokeOnCtx(
          ctx,
          [pt],
          chalkColor,
          tool === 'eraser' ? 44 : 3.6,
          tool === 'eraser'
        )
        ctx.restore()
      }
    }

    if (tool === 'eraser') {
      setActiveEraserD(`M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)} l 0.1 0.1`)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || tool === 'browse') return
    const pt = getCoordinates(e)
    const pts = currentPointsRef.current
    const lastPt = pts[pts.length - 1]
    pts.push(pt)

    // Incremental real-time draw to canvas (zero lag)
    const canvas = canvasRef.current
    if (canvas && lastPt) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        ctx.save()
        ctx.scale(dpr, dpr)
        if (tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out'
          ctx.strokeStyle = 'rgba(0,0,0,1)'
          ctx.lineWidth = 44
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.beginPath()
          ctx.moveTo(lastPt.x, lastPt.y)
          ctx.lineTo(pt.x, pt.y)
          ctx.stroke()

          // Faint eraser dust smudge
          ctx.globalCompositeOperation = 'source-over'
          ctx.strokeStyle = 'rgba(242, 240, 232, 0.035)'
          ctx.lineWidth = 38
          ctx.stroke()
        } else {
          ctx.globalCompositeOperation = 'source-over'
          ctx.strokeStyle = chalkColor
          ctx.lineWidth = 3.6
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.shadowColor = chalkColor
          ctx.shadowBlur = 2.5
          ctx.beginPath()
          ctx.moveTo(lastPt.x, lastPt.y)
          ctx.lineTo(pt.x, pt.y)
          ctx.stroke()
        }
        ctx.restore()
      }
    }

    if (tool === 'eraser') {
      setActiveEraserD(pointsToSvgPath(pts))
    }
  }

  const finishStroke = useCallback(() => {
    if (!isDrawingRef.current || currentPointsRef.current.length === 0) {
      isDrawingRef.current = false
      currentPointsRef.current = []
      setActiveEraserD('')
      return
    }

    const pts = [...currentPointsRef.current]
    const d = pointsToSvgPath(pts)
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    const newAction: Action = {
      id,
      type: tool as 'chalk' | 'eraser',
      points: pts,
      color: chalkColor,
      width: tool === 'eraser' ? 44 : 3.6,
      d,
    }

    const updatedActions = [...actionsRef.current, newAction]
    setActions(updatedActions)

    // If eraser, also record in DOM mask for erasing website text
    if (tool === 'eraser') {
      setEraseStrokes((prev) => [...prev, { id, d, width: 44 }])
    }

    // Re-render smoothed curves on canvas
    redrawCanvas(updatedActions)

    isDrawingRef.current = false
    currentPointsRef.current = []
    setActiveEraserD('')
  }, [tool, chalkColor, redrawCanvas])

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
    finishStroke()
  }

  const handlePointerCancel = (e: React.PointerEvent) => {
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
    finishStroke()
  }

  const handleUndo = () => {
    if (actionsRef.current.length === 0) return
    const last = actionsRef.current[actionsRef.current.length - 1]
    const updated = actionsRef.current.slice(0, -1)
    setActions(updated)

    if (last.type === 'eraser') {
      setEraseStrokes((prev) => prev.filter((s) => s.id !== last.id))
    }

    redrawCanvas(updated)
  }

  const handleCleanBoard = () => {
    setActions([])
    setEraseStrokes([])
    setActiveEraserD('')
    isDrawingRef.current = false
    currentPointsRef.current = []

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const hasDomErasures = eraseStrokes.length > 0 || (tool === 'eraser' && activeEraserD !== '')

  const currentCursor =
    tool === 'chalk'
      ? getChalkCursor(chalkColor)
      : tool === 'eraser'
      ? getEraserCursor()
      : 'default'

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen"
      style={{
        cursor: tool !== 'browse' ? currentCursor : undefined,
      }}
    >
      {/* SVG Container holding the DOM Content Eraser Mask */}
      <svg
        className="absolute inset-0 pointer-events-none w-full"
        style={{ height: dimensions.h }}
        viewBox={`0 0 ${dimensions.w} ${dimensions.h}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <mask
            id="dom-content-eraser-mask"
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={dimensions.w}
            height={dimensions.h}
          >
            {/* White reveals website contents */}
            <rect x="0" y="0" width={dimensions.w} height={dimensions.h} fill="white" />

            {/* Black strokes punch holes through DOM text, headers, and cards */}
            {eraseStrokes.map((s) => (
              <path
                key={s.id}
                d={s.d}
                fill="none"
                stroke="black"
                strokeWidth={s.width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Live active eraser path while dragging */}
            {tool === 'eraser' && activeEraserD && (
              <path
                d={activeEraserD}
                fill="none"
                stroke="black"
                strokeWidth={44}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </mask>
        </defs>
      </svg>

      {/* 
        1. The Erasable DOM Content Layer:
        Masked so the eraser cleanly rubs away letters, headings, and cards to expose the blackboard underneath.
        Notice: User chalk is NOT inside this mask, so visitors can draw and redraw over erased spots freely!
      */}
      <div
        className="relative z-10 w-full"
        style={{
          mask: hasDomErasures ? 'url(#dom-content-eraser-mask)' : undefined,
          WebkitMask: hasDomErasures ? 'url(#dom-content-eraser-mask)' : undefined,
        }}
      >
        {children}
      </div>

      {/* 
        2. High-Performance Chronological Chalk & Eraser Canvas:
        Placed at z-30 (above video and all DOM content).
        Supports infinite draw -> erase -> redraw cycles over the same spot without any mask blocking bugs!
      */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full z-30"
        style={{
          height: dimensions.h,
        }}
      />

      {/* Pointer Interceptor Layer (Captures drawing when Chalk or Eraser is active) */}
      {tool !== 'browse' && (
        <div
          className="fixed inset-0 z-40 touch-none select-none"
          style={{ cursor: currentCursor }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        />
      )}

      {/* Desktop Chalkboard Tool Dock (The Chalk Tray) */}
      {isDesktop && (
        <aside
          aria-label="Blackboard Drawing Tools"
          className="fixed bottom-5 right-6 z-50 flex flex-col items-end gap-2 select-none"
        >
          {/* Status Tooltip / Hint */}
          {tool !== 'browse' && (
            <div className="bg-[#171412]/95 text-chalk text-xs px-3 py-1.5 rounded-lg border border-[#443123] shadow-lg backdrop-blur-sm animate-fade-in flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse bg-yellow-400" />
              <span>
                {tool === 'chalk'
                  ? 'Chalk Active: Click & drag anywhere • Press Esc to browse'
                  : 'Eraser Active: Rub over letters or chalk • Press Esc to browse'}
              </span>
              <button
                type="button"
                onClick={() => setTool('browse')}
                className="ml-1 text-chalk-3 hover:text-chalk underline cursor-pointer text-[11px]"
              >
                Done
              </button>
            </div>
          )}

          {/* Wooden Chalk Ledge */}
          <div className="bg-[#241a14]/95 text-chalk border border-[#523c2a] shadow-[0_12px_32px_rgba(0,0,0,0.65)] rounded-2xl p-1.5 flex items-center gap-1.5 backdrop-blur-md">
            {/* Browse Button */}
            <button
              type="button"
              onClick={() => setTool('browse')}
              title="Browse Mode (Esc) — Click links and navigate"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                tool === 'browse'
                  ? 'bg-[#3b2b20] text-chalk font-semibold shadow-inner border border-[#6b4e37]'
                  : 'text-chalk-2 hover:bg-[#32241b] hover:text-chalk'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                <path d="m13 13 6 6" />
              </svg>
              <span>Browse</span>
            </button>

            <div className="w-px h-5 bg-[#453123]" />

            {/* Chalk Button & Colors */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTool('chalk')}
                title="Chalk (C) — Draw in chalk on the blackboard"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  tool === 'chalk'
                    ? 'bg-[#3b2b20] text-chalk font-semibold shadow-inner border border-[#6b4e37]'
                    : 'text-chalk-2 hover:bg-[#32241b] hover:text-chalk'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 2 4 4-12 12H6v-4L18 2z" />
                  <path d="m15 5 3 3" />
                </svg>
                <span>Chalk</span>
              </button>

              {/* Quick color swatches */}
              <div className="flex items-center gap-1 pl-0.5 pr-1">
                {CHALK_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setChalkColor(c.value)
                      setTool('chalk')
                    }}
                    title={`${c.name} Chalk`}
                    className={`w-4 h-4 rounded-full transition-transform cursor-pointer border ${
                      chalkColor === c.value && tool === 'chalk'
                        ? 'scale-125 border-chalk ring-1 ring-white/50'
                        : 'border-black/50 hover:scale-110 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            <div className="w-px h-5 bg-[#453123]" />

            {/* Eraser Button */}
            <button
              type="button"
              onClick={() => setTool('eraser')}
              title="Eraser (E) — Rub away letters or chalk from the blackboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                tool === 'eraser'
                  ? 'bg-[#3b2b20] text-chalk font-semibold shadow-inner border border-[#6b4e37]'
                  : 'text-chalk-2 hover:bg-[#32241b] hover:text-chalk'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                <path d="M22 21H7" />
                <path d="m5 11 9 9" />
              </svg>
              <span>Eraser</span>
            </button>

            <div className="w-px h-5 bg-[#453123]" />

            {/* Undo Button */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={actions.length === 0}
              title="Undo Stroke (Ctrl+Z)"
              className="p-2 rounded-xl text-chalk-2 hover:text-chalk hover:bg-[#32241b] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
            </button>

            {/* Clean Board Button */}
            <button
              type="button"
              onClick={handleCleanBoard}
              title="Clean Board — Wash away all doodles & restore all erased content"
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs text-yellow-300 hover:text-yellow-200 hover:bg-[#3d2a1c] transition-all cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" />
                <path d="m4.93 4.93 2.83 2.83" />
                <path d="M2 12h4" />
                <path d="m4.93 19.07 2.83-2.83" />
                <path d="M12 18v4" />
                <path d="m19.07 19.07-2.83-2.83" />
                <path d="M18 12h4" />
                <path d="m19.07 4.93-2.83 2.83" />
              </svg>
              <span>Clean Board</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}
