'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Bug, Lightbulb, Send, CheckCircle } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function FeedbackPage() {
  const [type, setType] = useState('suggestion')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', category: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Preenche todos os campos obrigatórios'); return }
    setSending(true)
    try {
      await api.post('/contact/feedback', {
        name: form.name,
        email: form.email,
        message: `[${type === 'bug' ? 'BUG' : 'SUGESTÃO'}] ${form.subject ? form.subject + '\n\n' : ''}${form.message}`,
        artworkId: null,
      })
      setSent(true)
    } catch {
      toast.error('Erro ao enviar. Tenta novamente.')
    }
    setSending(false)
  }

  if (sent) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Obrigado!</h1>
        <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
          {type === 'bug' ? 'O teu relatório foi recebido. Vamos analisar e corrigir o problema o mais rápido possível.' : 'A tua sugestão foi recebida. Adoramos ouvir ideias da comunidade!'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '', category: '' }) }}
            className="px-4 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:border-blue-300 transition-colors">
            Enviar outro
          </button>
          <Link href="/" className="px-4 py-2.5 bg-blue-500 text-white font-bold text-sm rounded-xl hover:bg-blue-600 transition-colors">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">

        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={22} className="text-blue-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2" style={{letterSpacing:'-0.03em'}}>
            Feedback
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Encontraste um bug ou tens uma sugestão? Conta-nos tudo!
          </p>
        </div>

        {/* Tipo */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setType('suggestion')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${type === 'suggestion' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${type === 'suggestion' ? 'bg-blue-500' : 'bg-gray-100'}`}>
              <Lightbulb size={18} className={type === 'suggestion' ? 'text-white' : 'text-gray-400'} />
            </div>
            <div>
              <div className={`text-sm font-extrabold ${type === 'suggestion' ? 'text-blue-700' : 'text-gray-700'}`}>Sugestão</div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">Ideias para melhorar o nauu</div>
            </div>
          </button>

          <button onClick={() => setType('bug')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${type === 'bug' ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-red-200'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${type === 'bug' ? 'bg-red-400' : 'bg-gray-100'}`}>
              <Bug size={18} className={type === 'bug' ? 'text-white' : 'text-gray-400'} />
            </div>
            <div>
              <div className={`text-sm font-extrabold ${type === 'bug' ? 'text-red-600' : 'text-gray-700'}`}>Relatório de bug</div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">Algo não está a funcionar</div>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4">

          {type === 'bug' && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 font-medium">
              💡 Descreve o que aconteceu, o que estavas a fazer quando ocorreu, e se possível o dispositivo/browser que usas.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nome *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="O teu nome" required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" placeholder="o.teu@email.com" required />
            </div>
          </div>

          <div>
            <label className="label">Assunto</label>
            <input value={form.subject} onChange={e => set('subject', e.target.value)} className="input"
              placeholder={type === 'bug' ? 'Ex: Erro ao fazer upload de imagem' : 'Ex: Filtro por técnica no catálogo'} />
          </div>

          <div>
            <label className="label">Mensagem *</label>
            <textarea value={form.message} onChange={e => set('message', e.target.value)} className="input resize-none" rows={5}
              placeholder={type === 'bug'
                ? 'Descreve o bug com o máximo de detalhe possível. O que aconteceu? O que esperavas que acontecesse?'
                : 'Descreve a tua sugestão. Quanto mais detalhe deres, melhor conseguimos perceber a ideia!'}
              required />
          </div>

          <button type="submit" disabled={sending}
            className={`w-full flex items-center justify-center gap-2 py-3 font-bold text-sm rounded-xl transition-colors ${type === 'bug' ? 'bg-red-400 hover:bg-red-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
            <Send size={15} /> {sending ? 'A enviar…' : type === 'bug' ? 'Enviar relatório' : 'Enviar sugestão'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 font-medium mt-5">
          Respondemos a todos os emails em 24-48 horas. Obrigado pelo teu contributo! 🙏
        </p>
      </div>
    </div>
  )
}
