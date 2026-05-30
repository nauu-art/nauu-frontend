'use client'
import { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function Newsletter({ compact = false }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await api.post('/auth/newsletter', { email, name })
      setDone(true)
      toast.success('Subscrito com sucesso!')
    } catch { toast.error('Erro ao subscrever') }
    setLoading(false)
  }

  if (done) return (
    <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
      <CheckCircle size={compact ? 14 : 18} className="text-green-500" />
      <span className="font-bold text-green-600">Subscrito com sucesso!</span>
    </div>
  )

  if (compact) return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="o.teu@email.com"
        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 font-medium" required />
      <button type="submit" disabled={loading}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-lg transition-colors">
        {loading ? '…' : 'Subscrever'}
      </button>
    </form>
  )

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white text-center">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
        <Mail size={22} className="text-white" />
      </div>
      <h2 className="text-xl font-extrabold mb-2 tracking-tight">Arte na tua caixa de entrada</h2>
      <p className="text-blue-100 text-sm font-medium mb-6 max-w-md mx-auto">
        Novos artistas, obras em destaque e inspiração. Sem spam, só arte.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="O teu nome"
          className="flex-1 text-sm border border-white/30 bg-white/10 rounded-xl px-4 py-3 outline-none focus:border-white placeholder:text-blue-200 text-white font-medium" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="o.teu@email.com"
          className="flex-1 text-sm border border-white/30 bg-white/10 rounded-xl px-4 py-3 outline-none focus:border-white placeholder:text-blue-200 text-white font-medium" required />
        <button type="submit" disabled={loading}
          className="px-6 py-3 bg-white text-blue-600 font-extrabold text-sm rounded-xl hover:bg-blue-50 transition-colors">
          {loading ? 'A subscrever…' : 'Subscrever'}
        </button>
      </form>
    </div>
  )
}
