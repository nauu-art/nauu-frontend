'use client'
import { useState, useEffect, useRef } from 'react'

function parseDimensions(str) {
  if (!str) return null
  const m = str.match(/(\d+(?:[.,]\d+)?)\s*[x×X]\s*(\d+(?:[.,]\d+)?)/i)
  if (!m) return null
  return {
    w: parseFloat(m[1].replace(',', '.')),
    h: parseFloat(m[2].replace(',', '.')),
  }
}

async function loadModelViewer() {
  if (typeof window === 'undefined') return
  if (customElements.get('model-viewer')) return
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.type = 'module'
    s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js'
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

async function generateGLB(imageUrl, wCm, hCm) {
  const THREE = (await import('three')).default || await import('three')
  const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js')

  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${window.location.origin}${imageUrl}`
  const resp = await fetch(fullUrl)
  const blob = await resp.blob()
  const localUrl = URL.createObjectURL(blob)

  const texture = await new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(localUrl, (t) => { URL.revokeObjectURL(localUrl); resolve(t) }, undefined, reject)
  })
  texture.colorSpace = THREE.SRGBColorSpace

  const wM = wCm / 100
  const hM = hCm / 100
  const frameSize = 0.03

  const scene = new THREE.Scene()

  const frameMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(wM + frameSize * 2, hM + frameSize * 2),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1, metalness: 0 })
  )
  frameMesh.position.z = -0.002
  scene.add(frameMesh)

  const artMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(wM, hM),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7, metalness: 0 })
  )
  scene.add(artMesh)

  scene.add(new THREE.AmbientLight(0xffffff, 1.5))
  const dir = new THREE.DirectionalLight(0xffffff, 1)
  dir.position.set(0, 1, 2)
  scene.add(dir)

  const glb = await new Promise((resolve, reject) =>
    new GLTFExporter().parse(scene, resolve, reject, { binary: true })
  )

  return URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }))
}

export default function ARViewer({ imageUrl, dimensions }) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [glbUrl, setGlbUrl] = useState(null)
  const glbRef = useRef(null)

  const dims = parseDimensions(dimensions)

  useEffect(() => {
    return () => { if (glbRef.current) URL.revokeObjectURL(glbRef.current) }
  }, [])

  if (!dims || !imageUrl) return null

  const handleOpen = async () => {
    setOpen(true)
    if (glbUrl) return
    setPhase('loading')
    try {
      await loadModelViewer()
      const url = await generateGLB(imageUrl, dims.w, dims.h)
      glbRef.current = url
      setGlbUrl(url)
      setPhase('ready')
    } catch (e) {
      console.error('[AR]', e)
      setPhase('error')
    }
  }

  const handleClose = () => setOpen(false)

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 font-bold text-sm rounded-xl transition-colors md:hidden"
      >
        <span>🪄</span>
        Ver em Tua Casa
        <span className="text-xs bg-purple-100 text-purple-400 px-1.5 py-0.5 rounded-full font-extrabold tracking-wide">
          BETA
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col" style={{ touchAction: 'none' }}>
          <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-safe-top flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent py-4">
            <div>
              <p className="text-white font-extrabold text-sm leading-tight">Ver em Tua Casa</p>
              <p className="text-purple-300 text-xs font-medium">{dims.w} × {dims.h} cm</p>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white text-xl font-light hover:bg-white/20 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            {phase === 'loading' && (
              <div className="text-center px-8">
                <div className="w-14 h-14 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
                <p className="text-white font-bold text-base mb-1">A preparar a visualização…</p>
                <p className="text-gray-400 text-sm">Isto pode demorar alguns segundos</p>
              </div>
            )}

            {phase === 'error' && (
              <div className="text-center px-8">
                <p className="text-5xl mb-4">⚠️</p>
                <p className="text-white font-extrabold text-lg mb-2">Não foi possível carregar</p>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Verifica se a obra tem dimensões definidas (ex: 80 × 60 cm) e tenta novamente.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  Fechar
                </button>
              </div>
            )}

            {phase === 'ready' && glbUrl && (
              <model-viewer
                src={glbUrl}
                ar
                ar-modes="webxr scene-viewer quick-look"
                ar-placement="wall"
                camera-controls
                auto-rotate
                auto-rotate-delay="500"
                rotation-per-second="20deg"
                shadow-intensity="1"
                shadow-softness="0.5"
                environment-image="neutral"
                style={{ width: '100vw', height: '100vh', background: '#111' }}
              >
                <div slot="progress-bar" />

                <button
                  slot="ar-button"
                  style={{
                    position: 'absolute',
                    bottom: 32,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 16,
                    padding: '16px 32px',
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em',
                  }}
                >
                  📱 Ver na Minha Parede
                </button>

                <div style={{
                  position: 'absolute',
                  bottom: 100,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.5)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: 20,
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(8px)',
                }}>
                  Tamanho real: {dims.w} × {dims.h} cm
                </div>
              </model-viewer>
            )}
          </div>
        </div>
      )}
    </>
  )
}
