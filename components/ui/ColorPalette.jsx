'use client'
import { useState, useEffect } from 'react'

function quantize(v) { return Math.min(255, Math.round(v / 32) * 32) }

function extractPalette(img, maxColors = 6) {
  const size = 80
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  const freq = {}
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    const key = `${quantize(data[i])},${quantize(data[i+1])},${quantize(data[i+2])}`
    freq[key] = (freq[key] || 0) + 1
  }

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
  const result = []
  for (const [key] of sorted) {
    if (result.length >= maxColors) break
    const [r, g, b] = key.split(',').map(Number)
    const tooClose = result.some(([pr, pg, pb]) =>
      Math.abs(pr - r) + Math.abs(pg - g) + Math.abs(pb - b) < 60
    )
    if (!tooClose) result.push([r, g, b])
  }
  return result.map(([r, g, b]) => ({
    hex: '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''),
    lum: 0.299 * r + 0.587 * g + 0.114 * b,
  }))
}

export default function ColorPalette({ imageUrl }) {
  const [colors, setColors] = useState([])
  const [copied, setCopied] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!imageUrl) return
    setColors([])
    const img = new Image()
    img.onload = () => {
      try { setColors(extractPalette(img)) } catch {}
    }
    img.src = imageUrl
  }, [imageUrl])

  if (!colors.length) return null

  const copy = (hex) => {
    navigator.clipboard.writeText(hex).catch(() => {})
    setCopied(hex)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="mt-3 px-1">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">
        Paleta de cores
      </div>
      <div className="flex gap-2 flex-wrap">
        {colors.map(({ hex, lum }) => (
          <button
            key={hex}
            onClick={() => copy(hex)}
            onMouseEnter={() => setTooltip(hex)}
            onMouseLeave={() => setTooltip(null)}
            className="relative w-9 h-9 rounded-xl border border-black/10 shadow-sm hover:scale-110 hover:shadow-md transition-transform"
            style={{ backgroundColor: hex }}
          >
            {(tooltip === hex || copied === hex) && (
              <span
                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow pointer-events-none z-20 border border-black/10"
                style={{ backgroundColor: hex, color: lum > 155 ? '#1a1a1a' : '#ffffff' }}
              >
                {copied === hex ? '✓ copiado' : hex}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
