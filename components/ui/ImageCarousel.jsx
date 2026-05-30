'use client'
import { useState, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageCarousel({ images, title, aspect = '4/5', className = '' }) {
  const [current, setCurrent] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const isHorizontal = useRef(false)
  const mouseStartX = useRef(null)

  if (!images || images.length === 0) return (
    <div className={`bg-blue-50 flex items-center justify-center ${className}`} style={{ aspectRatio: aspect }}>
      <span className="text-blue-200 text-5xl font-extrabold">{title?.[0]}</span>
    </div>
  )

  if (images.length === 1) return (
    <div className={`overflow-hidden ${className}`} style={{ aspectRatio: aspect }}>
      <img src={images[0].imageUrl} alt={title} className="w-full h-full object-cover" draggable={false} />
    </div>
  )

  const goTo = (i) => setCurrent((i + images.length) % images.length)

  const prev = (e) => { e?.preventDefault(); e?.stopPropagation(); goTo(current - 1) }
  const next = (e) => { e?.preventDefault(); e?.stopPropagation(); goTo(current + 1) }

  // Mouse drag
  const onMouseDown = (e) => {
    mouseStartX.current = e.clientX
    setDragging(true)
    setDragOffset(0)
  }
  const onMouseMove = (e) => {
    if (!dragging || mouseStartX.current === null) return
    const offset = e.clientX - mouseStartX.current
    if ((current === 0 && offset > 0) || (current === images.length - 1 && offset < 0)) return
    setDragOffset(offset)
  }
  const onMouseUp = (e) => {
    if (!dragging) return
    const diff = mouseStartX.current - e.clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0 && current < images.length - 1) goTo(current + 1)
      else if (diff < 0 && current > 0) goTo(current - 1)
    }
    setDragging(false)
    setDragOffset(0)
    mouseStartX.current = null
  }

  // Touch
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontal.current = false
    setDragOffset(0)
  }
  const onTouchMove = (e) => {
    if (!touchStartX.current) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    if (!isHorizontal.current && Math.abs(dx) > dy && Math.abs(dx) > 8) isHorizontal.current = true
    if (isHorizontal.current) {
      e.preventDefault()
      if ((current === 0 && dx > 0) || (current === images.length - 1 && dx < 0)) return
      setDragOffset(dx)
    }
  }
  const onTouchEnd = (e) => {
    if (!touchStartX.current) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (isHorizontal.current && Math.abs(diff) > 35) {
      e.stopPropagation()
      if (diff > 0 && current < images.length - 1) goTo(current + 1)
      else if (diff < 0 && current > 0) goTo(current - 1)
    }
    touchStartX.current = null
    isHorizontal.current = false
    setDragOffset(0)
  }

  return (
    <div
      className={`relative overflow-hidden group select-none ${className} ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ aspectRatio: aspect }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { if (dragging) { setDragging(false); setDragOffset(0); mouseStartX.current = null } }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}>

      {/* Strip de imagens */}
      <div
        className="flex h-full w-full"
        style={{
          transform: `translateX(calc(${-current * 100}% + ${dragOffset}px))`,
          transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform',
        }}>
        {images.map((img, i) => (
          <div key={img.id || i} className="w-full h-full flex-shrink-0">
            <img src={img.imageUrl} alt={title} draggable={false} className="w-full h-full object-cover pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Setas */}
      {current > 0 && (
        <button type="button" onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <ChevronLeft size={14} />
        </button>
      )}
      {current < images.length - 1 && (
        <button type="button" onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <ChevronRight size={14} />
        </button>
      )}

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {images.map((_, i) => (
          <button key={i} type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(i) }}
            className={`rounded-full transition-all duration-200 ${i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`} />
        ))}
      </div>
    </div>
  )
}
