'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Send, Image, Package, ArrowLeft } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ConversationView({ conversationId, onBack }) {
  const { user } = useAuth()
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showShipment, setShowShipment] = useState(false)
  const [shipment, setShipment] = useState({ carrier: '', trackingNumber: '', trackingUrl: '' })
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    if (conversationId) {
      fetchConversation()
      pollRef.current = setInterval(fetchConversation, 10000)
    }
    return () => clearInterval(pollRef.current)
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages])

  const fetchConversation = async () => {
    try {
      const res = await api.get(`/messages/${conversationId}`)
      setConversation(res.data)
    } catch {}
    setLoading(false)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    try {
      const res = await api.post(`/messages/${conversationId}/reply`, { content: message })
      setConversation(prev => ({ ...prev, messages: [...(prev?.messages || []), res.data] }))
      setMessage('')
    } catch { toast.error('Erro ao enviar') }
    setSending(false)
  }

  const handleImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    try {
      const res = await api.post(`/messages/${conversationId}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setConversation(prev => ({ ...prev, messages: [...(prev?.messages || []), res.data] }))
      toast.success('Imagem enviada!')
    } catch { toast.error('Erro ao enviar imagem') }
  }

  const handleShipment = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/messages/${conversationId}/shipment`, shipment)
      setShowShipment(false)
      setShipment({ carrier: '', trackingNumber: '', trackingUrl: '' })
      fetchConversation()
      toast.success('Tracking adicionado!')
    } catch { toast.error('Erro') }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
  if (!conversation) return <div className="flex-1 flex items-center justify-center text-gray-300 font-bold">Conversa nao encontrada</div>

  const other = conversation.participants?.find(p => p.userId !== user?.id)
  const otherName = other?.user?.artistProfile?.artistName || other?.user?.name || 'Utilizador'
  const otherAvatar = other?.user?.avatarUrl
  const myRole = conversation.participants?.find(p => p.userId === user?.id)?.role
  const isArtist = myRole === 'ARTIST'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="p-1.5 text-gray-400 hover:text-gray-700 md:hidden">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-500 font-extrabold flex-shrink-0">
          {otherAvatar ? <img src={otherAvatar} className="w-full h-full object-cover" alt="" /> : otherName?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-extrabold text-gray-900 truncate">{otherName}</div>
          {conversation.artwork && (
            <Link href={`/artwork/${conversation.artwork.id}`} className="text-xs text-blue-500 font-medium truncate block hover:text-blue-600">
              {conversation.artwork.title}
            </Link>
          )}
        </div>
        {isArtist && (
          <button onClick={() => setShowShipment(!showShipment)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 text-xs font-bold rounded-lg transition-colors">
            <Package size={13} /> Tracking
          </button>
        )}
      </div>

      {showShipment && (
        <form onSubmit={handleShipment} className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex flex-col gap-2">
          <div className="text-xs font-extrabold text-blue-700 mb-1">Adicionar tracking de envio</div>
          <div className="grid grid-cols-2 gap-2">
            <input value={shipment.carrier} onChange={e => setShipment(s => ({...s, carrier: e.target.value}))} placeholder="Transportadora (CTT, DHL)" className="input text-xs" />
            <input value={shipment.trackingNumber} onChange={e => setShipment(s => ({...s, trackingNumber: e.target.value}))} placeholder="Numero de tracking" className="input text-xs" />
          </div>
          <input value={shipment.trackingUrl} onChange={e => setShipment(s => ({...s, trackingUrl: e.target.value}))} placeholder="URL de tracking (opcional)" className="input text-xs" />
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1.5 bg-blue-500 text-white font-bold text-xs rounded-lg">Confirmar envio</button>
            <button type="button" onClick={() => setShowShipment(false)} className="px-3 py-1.5 border border-gray-200 text-gray-500 font-bold text-xs rounded-lg">Cancelar</button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {conversation.messages?.map(msg => {
          const isMe = msg.senderId === user?.id
          const isSystem = ['SHIPPING', 'SYSTEM', 'ORDER_UPDATE'].includes(msg.type)

          if (isSystem) return (
            <div key={msg.id} className="flex justify-center">
              <div className="bg-gray-100 text-gray-500 text-xs font-medium px-4 py-2 rounded-full max-w-xs text-center">
                {msg.content}
              </div>
            </div>
          )

          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-500 font-extrabold text-xs flex-shrink-0 mt-1">
                  {otherAvatar ? <img src={otherAvatar} className="w-full h-full object-cover" alt="" /> : otherName?.[0]}
                </div>
              )}
              <div className={`max-w-xs md:max-w-sm ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {msg.type === 'IMAGE' && msg.imageUrl ? (
                  <img src={msg.imageUrl} alt="" className="max-w-[200px] rounded-2xl cursor-pointer" onClick={() => window.open(msg.imageUrl, '_blank')} />
                ) : (
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${isMe ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                )}
                <div className={`text-xs text-gray-400 ${isMe ? 'text-right' : ''}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {(isArtist ? conversation.canArtistReply : conversation.canBuyerReply) ? (
        <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0">
            <Image size={18} />
          </button>
          <input value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Escreve uma mensagem"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-300"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }} />
          <button type="submit" disabled={sending || !message.trim()}
            className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-40 flex-shrink-0">
            <Send size={16} />
          </button>
        </form>
      ) : (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400 font-medium">
          Esta conversa esta fechada
        </div>
      )}
    </div>
  )
}
