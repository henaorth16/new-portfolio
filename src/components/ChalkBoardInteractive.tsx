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

interface ChalkBoardInteractiveProps {
  children: React.ReactNode
}

export default function ChalkBoardInteractive({ children }: ChalkBoardInteractiveProps) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [tool, setTool] = useState<ToolType>('browse')
  const [chalkColor, setChalkColor] = useState(CHALK_COLORS[0].value)
  const [isDrawing, setIsDrawing] = useState(false)

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
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = useState({ w: 1200, h: 2000 })

  // Track realistic floating chalk/eraser cursor with high-performance 120fps direct transform
  useEffect(() => {
    if (tool === 'browse') {
      if (cursorRef.current) cursorRef.current.style.opacity = '0'
      return
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
        cursorRef.current.style.opacity = '1'
      }
    }

    const handlePointerLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '0'
    }

    window.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('mouseleave', handlePointerLeave)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('mouseleave', handlePointerLeave)
    }
  }, [tool])

  // Screen width detection (tablets and desktops >= 768px)
  useEffect(() => {
    const checkScreen = () => {
      const match = window.matchMedia('(min-width: 768px)').matches
      setIsDesktop(match)
    }
    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
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
        if (!e.ctrlKey && !e.metaKey) {
          setIsOpen(true)
          setTool('chalk')
        }
      } else if (e.key === 'e' || e.key === 'E') {
        setIsOpen(true)
        setTool('eraser')
      } else if (e.key === 'Escape') {
        setTool('browse')
        setIsOpen(false)
      } else if (e.key === 'v' || e.key === 'V') {
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
    setIsDrawing(true)
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
    setIsDrawing(false)
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

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen"
      style={{
        cursor: tool !== 'browse' ? 'none' : undefined,
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
          style={{ cursor: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        />
      )}

      {/* Realistic Floating Chalk & Eraser Cursor (Pure Divs + CSS Styling) */}
      {tool !== 'browse' && (
        <div
          ref={cursorRef}
          className="fixed top-0 left-0 pointer-events-none z-50 select-none transition-opacity duration-150 will-change-transform"
          style={{
            opacity: 0,
            transform: 'translate3d(-200px, -200px, 0)',
          }}
          aria-hidden="true"
        >
          {/* Realistic Chalk Stick: Compact, right-side up natural angle, dynamic color */}
          {tool === 'chalk' && (
            <div
              className="relative pointer-events-none"
              style={{
                transform: 'rotate(151deg) scale(0.96)',
                transformOrigin: '0% 100%',
                marginTop: '-44px',
                marginLeft: '0px',
                transition: 'transform 0.08s ease-out',
                filter: 'drop-shadow(2px 5px 7px rgba(0,0,0,0.55))',
              }}
            >
              {/* Realistic 3D Cylindrical Chalk Body with Dynamic Color */}
              <div
                className="relative w-2.5 h-9 rounded-t-sm overflow-hidden"
                style={{
                  backgroundColor: chalkColor,
                  boxShadow:
                    'inset -2px 0 3px rgba(0,0,0,0.35), inset 1.5px 0 2px rgba(255,255,255,0.5), 0 0 1px rgba(0,0,0,0.3)',
                }}
              >
                {/* Cylindrical 3D lighting gradient */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 25%, transparent 50%, rgba(0,0,0,0.25) 80%, rgba(0,0,0,0.45) 100%)',
                  }}
                />


                {/* Chalk powdery grain overlay */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #fff 15%, transparent 20%)',
                    backgroundSize: '2px 2px',
                  }}
                />
              </div>

              {/* Slanted Beveled Drawing Tip (Drawing Contact Point touching 0,0) */}
              <div
                className="relative w-2.5 h-2 overflow-hidden"
                style={{
                  backgroundColor: chalkColor,
                  clipPath: 'polygon(0% 100%, 100% 20%, 100% 0%, 0% 0%)',
                  boxShadow:
                    'inset 1px 0 2px rgba(255,255,255,0.45), inset -1px 0 2px rgba(0,0,0,0.35)',
                }}
              />
            </div>
          )}

          {/* Realistic Blackboard Felt & Wood Eraser */}
          {tool === 'eraser' && (
            <div
              className="relative select-none pointer-events-none"
              style={{
                width: '54px',
                height: '30px',
                marginLeft: '-27px',
                marginTop: '-15px',
                transform: isDrawing ? 'rotate(-10deg) scale(0.96)' : 'rotate(-6deg)',
                transition: 'transform 0.08s ease-out',
                filter: 'drop-shadow(3px 6px 10px rgba(0,0,0,0.6))',
              }}
            >
              {/* Hardwood Handle Block (Top Half) */}
              <div
                className="relative w-full h-[14px] rounded-t-md overflow-hidden border border-[#482810]"
                style={{
                  background:
                    'linear-gradient(180deg, #965a25 0%, #7c4416 55%, #592d0b 100%)',
                  boxShadow:
                    'inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {/* Finger Grip Indentation */}
                <div className="absolute top-1 inset-x-2 h-1 rounded-full bg-[#422006] shadow-[inset_0_1px_2px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.2)]" />
                {/* Wood grain streaks */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.6) 3px, rgba(0,0,0,0.6) 4px)',
                  }}
                />
              </div>

              {/* Wood-to-Felt Divider Seam */}
              <div className="w-full h-[1.5px] bg-[#2a1302] shadow-inner" />

              {/* Multi-Ply Wool Felt Layer (Bottom Half) */}
              <div
                className="relative w-full h-[14px] rounded-b-sm overflow-hidden border border-[#1b1c1c]"
                style={{
                  background:
                    'linear-gradient(180deg, #2b2c2c 0%, #202121 65%, #141515 100%)',
                  boxShadow:
                    'inset 0 -2px 3px rgba(242,240,232,0.3), inset 0 1px 2px rgba(0,0,0,0.6)',
                }}
              >
                {/* Layered Felt Strips */}
                <div
                  className="absolute inset-0 opacity-45 pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, #1b1c1c, #1b1c1c 5px, #3a3b3b 5px, #3a3b3b 8px)',
                  }}
                />
                
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop Chalkboard Tool Dock (Collapsible & Theme-Matched) */}
      {isDesktop && (
        <aside
          aria-label="Blackboard Drawing Tools"
          className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 select-none"
        >
          {/* Status Tooltip / Hint when drawing tool is active */}
          {isOpen && tool !== 'browse' && (
            <div className="bg-board/95 text-chalk text-xs px-3 py-1.5 rounded-xl border border-chalk/20 shadow-lg backdrop-blur-md animate-fade-in flex items-center gap-2 font-body">
              <span className="w-2 h-2 rounded-full bg-yellow" />
              <span>
                {tool === 'chalk'
                  ? 'Chalk Active: Click & drag to draw • Press Esc to browse'
                  : 'Eraser Active: Rub over chalk or text • Press Esc to browse'}
              </span>
              <button
                type="button"
                onClick={() => setTool('browse')}
                className="ml-1 text-chalk-3 hover:text-chalk underline cursor-pointer text-[11px]"
              >
                Browse mode
              </button>
            </div>
          )}

          {!isOpen ? (
            /* Collapsed Trigger Button: sleek, matches the site aesthetic */
            <button
              type="button"
              onClick={() => {
                setIsOpen(true)
              }}
              className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-board/90 hover:bg-board border border-chalk/25 hover:border-yellow text-chalk hover:text-yellow shadow-[0_8px_24px_rgba(0,0,0,0.55)] backdrop-blur-md transition-all duration-200 cursor-pointer active:scale-95"
              title="Open blackboard drawing tools (Press C)"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:-rotate-12 text-yellow">
                <path d="m18 2 4 4-12 12H6v-4L18 2z" />
                <path d="m15 5 3 3" />
              </svg>
              <span className="font-display text-sm tracking-wide">Draw on Board</span>
              {actions.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-yellow" title="Board has active drawings" />
              )}
            </button>
          ) : (
            /* Expanded Tool Tray: chalkboard dark background, subtle chalk borders */
            <div className="bg-board/95 text-chalk border border-chalk/20 shadow-[0_12px_36px_rgba(0,0,0,0.65)] rounded-2xl p-1.5 flex items-center gap-1.5 backdrop-blur-md animate-fade-in">
              {/* Browse Button */}
              <button
                type="button"
                onClick={() => setTool('browse')}
                title="Browse Mode (Esc) — Click links and navigate"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display transition-all cursor-pointer ${
                  tool === 'browse'
                    ? 'bg-chalk/15 text-chalk font-semibold border border-chalk/30 shadow-inner'
                    : 'text-chalk-2 hover:bg-chalk/10 hover:text-chalk'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                  <path d="m13 13 6 6" />
                </svg>
                <span>Browse</span>
              </button>

              <div className="w-px h-5 bg-chalk/15" />

              {/* Chalk Button */}
              <button
                type="button"
                onClick={() => setTool('chalk')}
                title="Chalk (C) — Draw in chalk on the blackboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display transition-all cursor-pointer ${
                  tool === 'chalk'
                    ? 'bg-chalk/15 text-chalk font-semibold border border-chalk/30 shadow-inner'
                    : 'text-chalk-2 hover:bg-chalk/10 hover:text-chalk'
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer border ${
                      chalkColor === c.value && tool === 'chalk'
                        ? 'scale-125 border-chalk ring-1 ring-white/50'
                        : 'border-black/50 hover:scale-110 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>

              <div className="w-px h-5 bg-chalk/15" />

              {/* Eraser Button */}
              <button
                type="button"
                onClick={() => setTool('eraser')}
                title="Eraser (E) — Rub away letters or chalk from the blackboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display transition-all cursor-pointer ${
                  tool === 'eraser'
                    ? 'bg-chalk/15 text-chalk font-semibold border border-chalk/30 shadow-inner'
                    : 'text-chalk-2 hover:bg-chalk/10 hover:text-chalk'
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                  <path d="M22 21H7" />
                  <path d="m5 11 9 9" />
                </svg>
                <span>Eraser</span>
              </button>

              <div className="w-px h-5 bg-chalk/15" />

              {/* Undo Button */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={actions.length === 0}
                title="Undo Stroke (Ctrl+Z)"
                className="p-1.5 rounded-xl text-chalk-2 hover:text-chalk hover:bg-chalk/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
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
                disabled={actions.length === 0 && !hasDomErasures}
                title="Clean Board — Wash away all doodles & restore all erased content"
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-display text-yellow hover:text-yellow/90 hover:bg-yellow/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4" />
                  <path d="m4.93 4.93 2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="m4.93 19.07 2.83-2.83" />
                  <path d="M12 18v4" />
                  <path d="m19.07 19.07-2.83-2.83" />
                  <path d="M18 12h4" />
                  <path d="m19.07 4.93-2.83 2.83" />
                </svg>
                <span>Clean</span>
              </button>

              <div className="w-px h-5 bg-chalk/15" />

              {/* Collapse Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setTool('browse')
                }}
                title="Collapse toolbar"
                className="p-1.5 rounded-xl text-chalk-3 hover:text-chalk hover:bg-chalk/10 transition-all cursor-pointer"
                aria-label="Collapse toolbar"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
