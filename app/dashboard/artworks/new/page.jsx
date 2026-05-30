'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../../context/AuthContext'
import { Upload, X } from 'lucide-react'
import DashboardNav from '../../../../components/ui/DashboardNav'
import api from '../../../../lib/api'
import toast from 'react-hot-toast'

export default function NovaObraPage() {
  const { user, isArtist, isLoggedIn, loading, logout } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', technique: '', dimensions: '',
    yearCreated: new Date().getFullYear(), price: '', priceOnRequest: false,
    availability: 'AVAILABLE', categoryIds: [],
  })

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
    api.get('/categories').then(res => setCategories(res.data || [])).catch(() => {})
  }, [loading, isLoggedIn, isArtist])

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews(prev => [...prev, ev.target.result])
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const toggleCategory = (id) => {
    setForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id) ? f.categoryIds.filter(c => c !== id) : [...f.categoryIds, id]
    }))
  }

  const handleDraft = async () => {
    if (!form.title) { toast.error('Título obrigatório'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        isDraft: true,
        price: form.priceOnRequest ? undefined : form.price ? Number(form.price) : undefined,
        yearCreated: form.yearCreated ? Number(form.yearCreated) : undefined,
      }
      const res = await api.post('/artworks', payload)
      if (images.length > 0) {
        const formData = new FormData()
        images.forEach(img => formData.append('images', img))
        await api.post(`/artworks/${res.data.id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      toast.success('Rascunho guardado!')
      router.push('/dashboard/artworks')
    } catch (err) { toast.error(err.response?.data?.error || 'Erro') }
    setSaving(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) { toast.error('Título obrigatório'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: form.priceOnRequest ? undefined : form.price ? Number(form.price) : undefined,
        yearCreated: form.yearCreated ? Number(form.yearCreated) : undefined,
      }
      const res = await api.post('/artworks', payload)
      const artworkId = res.data.id

      if (images.length > 0) {
        const formData = new FormData()
        images.forEach(img => formData.append('images', img))
        await api.post(`/artworks/${artworkId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      toast.success('Obra publicada!')
      router.push('/dashboard/artworks')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao publicar obra')
    }
    setSaving(false)
  }

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="flex-1 p-8">
        <div className="flex items-center gap-3 mb-7">
          <Link href="/dashboard/artworks" className="text-sm font-bold text-gray-400 hover:text-gray-600">← Voltar</Link>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{letterSpacing:'-0.03em'}}>Nova obra</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-5">
          <div className="col-span-2 flex flex-col gap-5">

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Informação básica</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label">Título *</label>
                  <input value={form.title} onChange={e => set('title', e.target.value)} className="input" placeholder="Nome da obra" required />
                </div>
                <div>
                  <label className="label">Descrição</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input resize-none" rows={3} placeholder="Descreve a obra..." />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label">Técnica</label>
                    <input value={form.technique} onChange={e => set('technique', e.target.value)} className="input" placeholder="Acrílico, óleo..." />
                  </div>
                  <div>
                    <label className="label">Dimensões</label>
                    <input value={form.dimensions} onChange={e => set('dimensions', e.target.value)} className="input" placeholder="80 x 60 cm" />
                  </div>
                  <div>
                    <label className="label">Ano</label>
                    <input type="number" value={form.yearCreated} onChange={e => set('yearCreated', e.target.value)} className="input" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Imagens</h2>
              <div className="flex flex-wrap gap-3 mb-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white">
                      <X size={10} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">Principal</span>}
                  </div>
                ))}
                <label className="w-24 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition-colors">
                  <Upload size={16} className="text-gray-300 mb-1" />
                  <span className="text-xs text-gray-300 font-bold">Adicionar</span>
                  <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-400 font-medium">A primeira imagem será a principal. Máximo 20MB por imagem.</p>
            </div>

          </div>

          <div className="flex flex-col gap-5">

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Preço</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label">Valor (€)</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                    disabled={form.priceOnRequest} className="input disabled:opacity-40" placeholder="0.00" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.priceOnRequest} onChange={e => set('priceOnRequest', e.target.checked)}
                    className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm font-semibold text-gray-600">Preço sob consulta</span>
                </label>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Disponibilidade</h2>
              <div className="flex flex-col gap-2">
                {[['AVAILABLE','Disponível','#2ECC71'],['RESERVED','Reservado','#F39C12'],['SOLD','Vendido','#E74C3C']].map(([val, label, color]) => (
                  <label key={val} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="radio" name="availability" value={val} checked={form.availability === val}
                      onChange={() => set('availability', val)} className="accent-blue-500" />
                    <span className="w-2 h-2 rounded-full" style={{background: color}}></span>
                    <span className="text-sm font-semibold text-gray-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Categoria</h2>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${form.categoryIds.includes(cat.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={handleDraft} disabled={saving}
              className="w-full py-2.5 border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 font-bold text-sm rounded-xl transition-colors">
              {saving ? 'A guardar…' : '💾 Guardar rascunho'}
            </button>
            <button type="submit" disabled={saving}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
              {saving ? 'A publicar…' : 'Publicar obra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
