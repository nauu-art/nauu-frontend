'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, Copy, CheckCircle, CreditCard, Smartphone, Building, ChevronRight } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const AMOUNTS = [2, 5, 10, 20, 50]

const METHODS = [
  { id: 'mbway', label: 'MB Way', icon: Smartphone, desc: 'Pagamento instantâneo' },
  { id: 'paypal', label: 'PayPal', icon: CreditCard, desc: 'Cartão ou saldo PayPal' },
  { id: 'transferencia', label: 'Transferência', icon: Building, desc: 'Transferência bancária' },
]

export default function DonatePage() {
  const [step, setStep] = useState(1) // 1: valor, 2: método, 3: dados, 4: confirmação
  const [amount, setAmount] = useState(5)
  const [customAmount, setCustomAmount] = useState('')
  const [method, setMethod] = useState('')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const finalAmount = customAmount ? Number(customAmount) : amount

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) { toast.error('Nome e email são obrigatórios'); return }
    setSending(true)
    try {
      await api.post('/auth/newsletter', {
        email: form.email,
        name: `[DOAÇÃO ${method.toUpperCase()} €${finalAmount}] ${form.name}`,
      })

      // Enviar email com instruções de pagamento
      await api.post('/contact/feedback', {
        name: form.name,
        email: form.email,
        message: `DOAÇÃO\nValor: €${finalAmount}\nMétodo: ${method.toUpperCase()}\nMensagem: ${form.message || '(sem mensagem)'}`,
      })

      setSent(true)
    } catch { toast.error('Erro ao processar. Tenta novamente.') }
    setSending(false)
  }

  if (sent) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Heart size={32} className="text-pink-500" fill="currentColor" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Obrigado, {form.name}! 💙</h1>
        <p className="text-gray-500 font-medium text-sm leading-relaxed mb-3">
          Enviámos para <strong>{form.email}</strong> as instruções de pagamento via <strong>{method === 'mbway' ? 'MB Way' : method === 'paypal' ? 'PayPal' : 'Transferência'}</strong>.
        </p>
        <p className="text-gray-400 text-xs font-medium mb-6">
          Após recebermos o pagamento de <strong>€{finalAmount}</strong>, enviaremos uma confirmação. Obrigado pelo apoio!
        </p>
        <Link href="/" className="inline-block px-6 py-3 bg-blue-500 text-white font-bold text-sm rounded-xl hover:bg-blue-600 transition-colors">
          Voltar ao início
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Heart size={22} className="text-pink-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2" style={{letterSpacing:'-0.03em'}}>
            Apoiar o nauu.art
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            O nauu.art é gratuito para todos. O teu apoio ajuda a mantê-lo assim.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {['Valor', 'Método', 'Confirmar'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold transition-all ${step > i+1 ? 'bg-green-500 text-white' : step === i+1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <span className={`text-xs font-bold ${step === i+1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
              {i < 2 && <ChevronRight size={12} className="text-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step 1 — Valor */}
        {step === 1 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-gray-900 mb-5">Quanto queres contribuir?</h2>
            <div className="flex gap-2 flex-wrap mb-4">
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => { setAmount(a); setCustomAmount('') }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${amount === a && !customAmount ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-200'}`}>
                  € {a}
                </button>
              ))}
              <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-all ${customAmount ? 'border-blue-500' : 'border-gray-200'}`}>
                <span className="px-3 text-sm font-bold text-gray-400 bg-gray-50 border-r border-gray-200 py-2.5">€</span>
                <input type="number" value={customAmount} onChange={e => { setCustomAmount(e.target.value); setAmount(0) }}
                  placeholder="Outro" className="w-20 px-3 py-2.5 text-sm font-bold outline-none" min="1" />
              </div>
            </div>
            <div className="text-center py-4 mb-5">
              <span className="text-4xl font-extrabold tracking-tight text-blue-500">€ {finalAmount || '—'}</span>
            </div>
            <button onClick={() => finalAmount > 0 && setStep(2)} disabled={!finalAmount}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors disabled:opacity-40">
              Continuar →
            </button>
          </div>
        )}

        {/* Step 2 — Método */}
        {step === 2 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-gray-900 mb-5">Como queres pagar?</h2>
            <div className="flex flex-col gap-3 mb-6">
              {METHODS.map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${method === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${method === m.id ? 'bg-blue-500' : 'bg-gray-100'}`}>
                    <m.icon size={18} className={method === m.id ? 'text-white' : 'text-gray-400'} />
                  </div>
                  <div>
                    <div className={`text-sm font-extrabold ${method === m.id ? 'text-blue-700' : 'text-gray-900'}`}>{m.label}</div>
                    <div className="text-xs text-gray-400 font-medium">{m.desc}</div>
                  </div>
                  {method === m.id && <div className="ml-auto text-blue-500 font-extrabold">✓</div>}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="px-4 py-3 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:border-gray-300 transition-colors">
                ← Voltar
              </button>
              <button onClick={() => method && setStep(3)} disabled={!method}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors disabled:opacity-40">
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirmar */}
        {step === 3 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-gray-900 mb-2">Os teus dados</h2>
            <p className="text-xs text-gray-400 font-medium mb-5">
              Vamos enviar-te as instruções de pagamento por email.
            </p>

            {/* Resumo */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 flex justify-between items-center">
              <div>
                <div className="text-sm font-extrabold text-blue-900">€ {finalAmount} via {method === 'mbway' ? 'MB Way' : method === 'paypal' ? 'PayPal' : 'Transferência'}</div>
                <div className="text-xs text-blue-400 font-medium">Receberás as instruções por email</div>
              </div>
              <button onClick={() => setStep(2)} className="text-xs font-bold text-blue-500 hover:text-blue-600">Alterar</button>
            </div>

            <form onSubmit={handleConfirm} className="flex flex-col gap-3">
              <div>
                <label className="label">Nome *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input" placeholder="O teu nome" required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input" placeholder="o.teu@email.com" required />
              </div>
              <div>
                <label className="label">Mensagem (opcional)</label>
                <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} className="input resize-none" rows={2} placeholder="Uma mensagem para a equipa…" />
              </div>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setStep(2)} className="px-4 py-3 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:border-gray-300 transition-colors">
                  ← Voltar
                </button>
                <button type="submit" disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm rounded-xl transition-colors">
                  <Heart size={15} /> {sending ? 'A processar…' : `Confirmar € ${finalAmount}`}
                </button>
              </div>
            </form>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 font-medium mt-6">
          Cada contributo faz diferença. Obrigado! 💙
        </p>
      </div>
    </div>
  )
}
