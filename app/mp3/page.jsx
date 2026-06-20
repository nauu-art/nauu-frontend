'use client'

import { useState, useRef } from 'react'
import { Download, Music, Link, CheckCircle, Loader, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]+/

function formatDuration(secs) {
  const s = parseInt(secs, 10)
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${rem.toString().padStart(2, '0')}`
}

export default function Mp3Page() {
  const [url, setUrl] = useState('')
  const [info, setInfo] = useState(null)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const isValidUrl = YT_REGEX.test(url.trim())

  async function handleFetchInfo() {
    const trimmed = url.trim()
    if (!trimmed || !isValidUrl) return
    setError('')
    setInfo(null)
    setLoadingInfo(true)
    try {
      const res = await fetch('/api/mp3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido')
      setInfo(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingInfo(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleFetchInfo()
  }

  async function handleDownload() {
    const trimmed = url.trim()
    if (!trimmed || downloading) return
    setDownloading(true)
    try {
      const link = document.createElement('a')
      link.href = `/api/mp3?url=${encodeURIComponent(trimmed)}`
      link.download = `${info?.title || 'audio'}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download iniciado!')
    } catch {
      toast.error('Erro ao iniciar o download.')
    } finally {
      setTimeout(() => setDownloading(false), 2000)
    }
  }

  function handleClear() {
    setUrl('')
    setInfo(null)
    setError('')
    inputRef.current?.focus()
  }

  function handlePaste() {
    navigator.clipboard.readText().then(text => {
      setUrl(text)
      setInfo(null)
      setError('')
    }).catch(() => inputRef.current?.focus())
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-50 to-white border-b border-gray-100 px-5 py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            <Music size={12} />
            YouTube para MP3
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4" style={{ letterSpacing: '-0.03em' }}>
            Descarrega em<br />
            <span className="text-blue-500">máxima qualidade</span>
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed text-base mb-10">
            Cola o link do YouTube e descarrega o áudio como MP3 a 320kbps. Grátis, sem anúncios e sem registo.
          </p>

          {/* Input */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-2 flex gap-2 max-w-xl mx-auto">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Link size={16} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={e => { setUrl(e.target.value); setInfo(null); setError('') }}
                onKeyDown={handleKeyDown}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none min-w-0"
                autoComplete="off"
                spellCheck={false}
              />
              {url && (
                <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={handleFetchInfo}
              disabled={!isValidUrl || loadingInfo}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2"
            >
              {loadingInfo ? <Loader size={14} className="animate-spin" /> : null}
              {loadingInfo ? 'A carregar...' : 'Continuar'}
            </button>
          </div>

          {/* Paste button */}
          {!url && (
            <button
              onClick={handlePaste}
              className="mt-3 text-xs text-blue-500 hover:text-blue-600 font-semibold transition-colors"
            >
              Colar da área de transferência
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 max-w-xl mx-auto flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Video info card */}
      {info && (
        <div className="max-w-xl mx-auto px-5 py-8">
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {info.thumbnail && (
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={info.thumbnail}
                  alt={info.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            )}
            <div className="p-5">
              <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-1">{info.author}</div>
              <h2 className="text-sm font-extrabold text-gray-900 leading-snug mb-3">{info.title}</h2>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs text-gray-400 font-medium">{formatDuration(info.duration)}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-xs text-green-600 font-extrabold flex items-center gap-1">
                  <CheckCircle size={11} /> 320 kbps
                </span>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {downloading
                  ? <><Loader size={15} className="animate-spin" /> A preparar o download...</>
                  : <><Download size={15} /> Descarregar MP3</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="max-w-3xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">Como funciona</div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: '-0.025em' }}>Três passos simples</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { step: '1', title: 'Cola o link', desc: 'Copia o URL do vídeo do YouTube que queres converter e cola no campo acima.' },
            { step: '2', title: 'Confirma', desc: 'Verifica o título e os detalhes do vídeo antes de descarregar.' },
            { step: '3', title: 'Descarrega', desc: 'Clica em "Descarregar MP3" e o ficheiro fica pronto no teu dispositivo.' },
          ].map(item => (
            <div key={item.step} className="border border-gray-100 rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-extrabold text-lg mx-auto mb-3">
                {item.step}
              </div>
              <div className="text-sm font-extrabold text-gray-900 mb-1.5">{item.title}</div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="border-t border-gray-100 px-5 py-8 text-center">
        <p className="text-xs text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
          Esta ferramenta é para uso pessoal. Respeita os direitos de autor — descarrega apenas conteúdo que tenhas permissão de utilizar.
        </p>
      </div>

    </div>
  )
}
