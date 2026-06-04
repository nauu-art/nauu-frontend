'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Anchor, Plus, X, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../context/LocaleContext'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AnchorButton({ artworkId, className = '' }) {
  const { isLoggedIn } = useAuth()
  const { t } = useLocale()
  const [anchored, setAnchored] = useState(false)
  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState([])
  const [added, setAdded] = useState({})
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newChestName, setNewChestName] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const pressTimer = useRef(null)
  const isLongPress = useRef(false)
  const buttonRef = useRef(null)
  const inputRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    api.get('/favorites').then(res => {
      setAnchored((res.data || []).some(f => f.id === artworkId))
    }).catch(() => {})
  }, [isLoggedIn, artworkId])

  useEffect(() => {
    if (showNewForm && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [showNewForm])

  const openChests = async () => {
    if (!isLoggedIn) { toast.error('Faz login para ancorar obras'); return }
    try {
      const res = await api.get('/collections')
      setCollections(res.data || [])
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const spaceRight = window.innerWidth - rect.right
        const spaceBottom = window.innerHeight - rect.bottom
        setDropPos({
          top: rect.bottom + 6,
          left: spaceRight < 240
            ? Math.max(4, rect.right - 224)
            : rect.left,
        })
      }
      setOpen(true)
    } catch {}
  }

  const quickSave = async () => {
    if (!isLoggedIn) { toast.error('Faz login para ancorar obras'); return }
    if (loading) return
    setLoading(true)
    try {
      if (anchored) {
        await api.delete(`/favorites/${artworkId}`)
        setAnchored(false)
        toast('Âncora removida', { icon: '⚓' })
      } else {
        await api.post(`/favorites/${artworkId}`)
        setAnchored(true)
        toast.success('Ancorado! ⚓')
      }
    } catch { toast.error('Erro') }
    setLoading(false)
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    isLongPress.current = false
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true
      if (navigator.vibrate) navigator.vibrate(30)
      openChests()
    }, 400)
  }

  const handleMouseUp = (e) => {
    e.preventDefault()
    e.stopPropagation()
    clearTimeout(pressTimer.current)
    if (!isLongPress.current && !open) quickSave()
  }

  const handleTouchStart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    isLongPress.current = false
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true
      if (navigator.vibrate) navigator.vibrate(30)
      openChests()
    }, 400)
  }

  const handleTouchEnd = (e) => {
    e.stopPropagation()
    clearTimeout(pressTimer.current)
    if (!isLongPress.current && !open) {
      e.preventDefault()
      quickSave()
    }
  }

  const handleTouchMove = () => {
    clearTimeout(pressTimer.current)
    isLongPress.current = false
  }

  const addToCollection = async (collectionId, name) => {
    try {
      await api.post(`/collections/${collectionId}/items`, { artworkId })
      setAdded(prev => ({...prev, [collectionId]: true}))
      if (!anchored) {
        await api.post(`/favorites/${artworkId}`)
        setAnchored(true)
      }
      toast.success(`Adicionado a "${name}"!`)
    } catch { toast.error('Já está neste baú') }
  }

  const handleCreateChest = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!newChestName.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/collections', { name: newChestName.trim(), isPublic: false })
      const newCol = res.data
      setCollections(prev => [...prev, { ...newCol, _count: { items: 0 } }])
      setNewChestName('')
      setShowNewForm(false)
      await addToCollection(newCol.id, newCol.name)
    } catch { toast.error('Erro ao criar baú') }
    setCreating(false)
  }

  const handleClose = () => {
    setOpen(false)
    setShowNewForm(false)
    setNewChestName('')
  }

  return (
    <div className="relative inline-block" onClick={e => e.stopPropagation()} style={{WebkitTouchCallout:"none",WebkitUserSelect:"none",userSelect:"none"}}>
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => clearTimeout(pressTimer.current)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        disabled={loading}
        className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full transition-all duration-200 shadow-sm select-none
          ${anchored ? 'bg-blue-500 text-white scale-110' : 'bg-white/90 text-gray-400 hover:text-blue-500 hover:scale-105'}
          ${className}`}>
        <Anchor size={10} className="md:hidden" strokeWidth={anchored ? 2.5 : 1.8} />
        <Anchor size={14} className="hidden md:block" strokeWidth={anchored ? 2.5 : 1.8} />
      </button>

      {open && mounted && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          <div
            className="fixed z-[100] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-56"
            style={{
              top: dropPos.top,
              left: dropPos.left,
              animation: 'dropdownIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              transformOrigin: 'top left',
            }}>
            <style>{`
              @keyframes dropdownIn {
                from { opacity: 0; transform: scale(0.92) translateY(-6px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>
            <div className="px-3 py-2.5 border-b border-gray-50 flex items-center justify-between">
              <div className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Os meus baús</div>
              <button onClick={handleClose} className="text-gray-300 hover:text-gray-500"><X size={13} /></button>
            </div>
            <div className="py-1 max-h-60 overflow-auto">
              {collections.length === 0 && !showNewForm && (
                <div className="px-3 py-3 text-xs text-gray-400 text-center">Ainda não tens baús</div>
              )}
              {collections.map(col => (
                <button key={col.id} onClick={() => addToCollection(col.id, col.name)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-left transition-colors
                    ${added[col.id] ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}`}>
                  <span className="text-base leading-none">{col.isDefault ? '⭐' : '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{col.name}</div>
                    <div className="text-xs text-gray-400">{col._count?.items || 0} obras</div>
                  </div>
                  {added[col.id] && <Check size={12} className="text-blue-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-50">
              {showNewForm ? (
                <form onSubmit={handleCreateChest} className="p-2 flex gap-1.5">
                  <input ref={inputRef} value={newChestName} onChange={e => setNewChestName(e.target.value)}
                    placeholder="Nome do baú…"
                    className="flex-1 text-xs px-2.5 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400"
                    onClick={e => e.stopPropagation()} />
                  <button type="submit" disabled={creating || !newChestName.trim()}
                    className="px-2.5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg disabled:opacity-50">
                    {creating ? '…' : '✓'}
                  </button>
                  <button type="button" onClick={() => { setShowNewForm(false); setNewChestName('') }}
                    className="px-2 py-2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setShowNewForm(true)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-bold text-gray-400 hover:text-blue-500 hover:bg-gray-50 transition-colors">
                  <Plus size={12} /> Novo baú
                </button>
              )}
            </div>
          </div>
        </>
      , document.body)}
    </div>
  )
}
