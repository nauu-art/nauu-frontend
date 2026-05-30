'use client'
import { useState } from 'react'
import { Bold, Italic, Heading1, Heading2, List, Link, Quote, Eye, Edit3 } from 'lucide-react'

export default function RichEditor({ value, onChange, placeholder = 'Escreve aqui…', dark = false }) {
  const [preview, setPreview] = useState(false)
  const textareaRef = typeof window !== 'undefined' ? null : null

  const insert = (before, after = '') => {
    const ta = document.getElementById('rich-editor-ta')
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.slice(start, end)
    const newVal = value.slice(0, start) + before + (selected || 'texto') + after + value.slice(end)
    onChange(newVal)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, start + before.length + (selected || 'texto').length) }, 10)
  }

  const renderHTML = (md) => {
    if (!md) return ''
    return md
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-400 pl-4 italic text-gray-500 my-3">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-500 underline">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/^/, '<p class="mb-3">')
      .replace(/$/, '</p>')
  }

  const btnClass = `p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors`

  const baseInput = dark
    ? 'w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-600 focus:border-blue-500'
    : 'w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:border-blue-400'

  return (
    <div className={`rounded-xl overflow-hidden border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-1 px-3 py-2 border-b ${dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <button type="button" onClick={() => insert('# ')} className={btnClass} title="Título 1"><Heading1 size={15} /></button>
        <button type="button" onClick={() => insert('## ')} className={btnClass} title="Título 2"><Heading2 size={15} /></button>
        <div className={`w-px h-4 mx-1 ${dark ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <button type="button" onClick={() => insert('**', '**')} className={btnClass} title="Negrito"><Bold size={15} /></button>
        <button type="button" onClick={() => insert('*', '*')} className={btnClass} title="Itálico"><Italic size={15} /></button>
        <div className={`w-px h-4 mx-1 ${dark ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <button type="button" onClick={() => insert('- ')} className={btnClass} title="Lista"><List size={15} /></button>
        <button type="button" onClick={() => insert('> ')} className={btnClass} title="Citação"><Quote size={15} /></button>
        <button type="button" onClick={() => insert('[', '](https://)')} className={btnClass} title="Link"><Link size={15} /></button>
        <div className="flex-1" />
        <button type="button" onClick={() => setPreview(!preview)}
          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${preview ? (dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600') : (dark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100')}`}>
          {preview ? <><Edit3 size={12} /> Editar</> : <><Eye size={12} /> Preview</>}
        </button>
      </div>

      {preview ? (
        <div className={`px-4 py-3 min-h-48 text-sm leading-relaxed ${dark ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-700'}`}
          dangerouslySetInnerHTML={{ __html: renderHTML(value) || `<span class="text-gray-400">${placeholder}</span>` }} />
      ) : (
        <textarea
          id="rich-editor-ta"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={12}
          className={`${baseInput} px-4 py-3 text-sm outline-none resize-none font-mono`}
        />
      )}

      <div className={`px-3 py-1.5 text-xs font-medium ${dark ? 'bg-gray-800 text-gray-600 border-t border-gray-700' : 'bg-gray-50 text-gray-400 border-t border-gray-100'}`}>
        Usa **negrito**, *itálico*, # Título, - lista, &gt; citação, [link](url)
      </div>
    </div>
  )
}
