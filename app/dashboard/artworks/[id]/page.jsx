'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../../context/AuthContext'
import { Upload, X, Trash2, Save } from 'lucide-react'
import DashboardNav from '../../../../components/ui/DashboardNav'
import api from '../../../../lib/api'
import toast from 'react-hot-toast'

export default function EditArtworkPage() {
  const { user, isArtist, isLoggedIn, loading, logout } = useAuth()
  const router = useRouter()
  const { id } = useParams()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [categories, setCategories] = useState([])
  const [artwork, setArtwork] = useState(null)
  const [newImages, setNewImages] = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', technique: '', dimensions: '',
    yearCreated: new Date().getFullYear(), price: '', priceOnRequest: false,
    availability: 'AVAILABLE', categoryIds: [], isDraft: false,
  })

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login')
    if (!loading && !isArtist) router.push('/')
  }, [loading, isLoggedIn, isArtist])

  useEffect(() => {
    if (isArtist && id) {
      Promise.all([
        api.get(`/artworks/${id}`),
        api.get('/categories'),
      ]).then(([artRes, catRes]) => {
        const w = artRes.data
        setArtwork(w)
        setCategories(catRes.data || [])
        setForm({
          title: w.title || '',
          description: w.description || '',
          technique: w.technique || '',
          dimensions: w.dimensions || '',
          yearCreated: w.yearCreated || new Date().getFullYear(),
          price: w.price || '',
          priceOnRequest: w.priceOnRequest || false,
          availability: w.availability || 'AVAILABLE',
          categoryIds: w.categories?.map(c => c.categoryId) || [],
          isDraft: w.isDraft || false,
        })
      }).catch(() => toast.error('Erro ao carregar obra'))
    }
  }, [isArtist, id])

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title) { toast.error('Título obrigatório'); return }
    setSaving(true)
    try {
      await api.put(`/artworks/${id}`, {
        ...form,
        isDraft: false,
        price: form.priceOnRequest ? undefined : form.price ? Number(form.price) : undefined,
        yearCreated: form.yearCreated ? Number(form.yearCreated) : undefined,
      })
      toast.success('Obra atualizada!')
      router.push('/dashboard/artworks')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao guardar')
    }
    setSaving(false)
  }

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files)
    setNewImages(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setNewPreviews(prev => [...prev, ev.target.result])
      reader.readAsDataURL(file)
    })
  }

  const handleUploadImages = async () => {
    if (!newImages.length) return
    setUploadingImages(true)
    try {
      const fd = new FormData()
      newImages.forEach(img => fd.append('images', img))
      await api.post(`/artworks/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Imagens adicionadas!')
      setNewImages([])
      setNewPreviews([])
      const res = await api.get(`/artworks/${id}`)
      setArtwork(res.data)
    } catch { toast.error('Erro ao fazer upload') }
    setUploadingImages(false)
  }

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Eliminar esta imagem?')) return
    try {
      await api.delete(`/artworks/${id}/images/${imageId}`)
      setArtwork(prev => ({...prev, images: prev.images.filter(i => i.id !== imageId)}))
      toast.success('Imagem eliminada')
    } catch { toast.error('Erro ao eliminar imagem') }
  }

  const handleDelete = async () => {
    if (!confirm(`Tens a certeza que queres eliminar "${form.title}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    try {
      await api.delete(`/artworks/${id}`)
      toast.success('Obra eliminada')
      router.push('/dashboard/artworks')
    } catch { toast.error('Erro ao eliminar obra') }
    setDeleting(false)
  }

  const toggleCategory = (catId) => {
    setForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(catId)
        ? f.categoryIds.filter(c => c !== catId)
        : [...f.categoryIds, catId]
    }))
  }

  if (loading || !user || !artwork) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/artworks" className="text-sm font-bold text-gray-400 hover:text-gray-600">← Voltar</Link>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{letterSpacing:'-0.03em'}}>Editar obra</h1>
          </div>
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-400 hover:bg-red-50 font-bold text-sm rounded-xl transition-colors">
            <Trash2 size={14} /> {deleting ? 'A eliminar…' : 'Eliminar obra'}
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-3 gap-5">
          <div className="col-span-2 flex flex-col gap-5">

            {/* Imagens existentes */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Imagens</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                {artwork.images?.map((img, i) => (
                  <div key={img.id} className="relative w-24 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    {img.isPrimary && <span className="absolute bottom-1 left-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">Principal</span>}
                    <button type="button" onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Novas imagens */}
              <div className="flex flex-wrap gap-3 mb-3">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden border-2 border-dashed border-blue-300">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => {
                      setNewImages(prev => prev.filter((_,idx) => idx !== i))
                      setNewPreviews(prev => prev.filter((_,idx) => idx !== i))
                    }} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition-colors">
                  <Upload size={16} className="text-gray-300 mb-1" />
                  <span className="text-xs text-gray-300 font-bold">Adicionar</span>
                  <input type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" />
                </label>
              </div>

              {newImages.length > 0 && (
                <button type="button" onClick={handleUploadImages} disabled={uploadingImages}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-lg transition-colors">
                  <Upload size={14} /> {uploadingImages ? 'A fazer upload…' : `Fazer upload (${newImages.length} imagens)`}
                </button>
              )}
            </div>

            {/* Informação básica */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Informação básica</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label">Título *</label>
                  <input value={form.title} onChange={e => set('title', e.target.value)} className="input" required />
                </div>
                <div>
                  <label className="label">Descrição</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input resize-none" rows={3} />
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
          </div>

          <div className="flex flex-col gap-5">
            {/* Preço */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Preço</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label">Valor (€)</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                    disabled={form.priceOnRequest} className="input disabled:opacity-40" placeholder="0.00" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.priceOnRequest} onChange={e => set('priceOnRequest', e.target.checked)} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm font-semibold text-gray-600">Preço sob consulta</span>
                </label>
              </div>
            </div>

            {/* Disponibilidade */}
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

            {/* Categoria */}
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

            {!form.isDraft ? (
              <button type="button" onClick={async () => {
                setSaving(true)
                try {
                  await api.put(`/artworks/${id}`, { ...form, isDraft: true, price: form.priceOnRequest ? undefined : form.price ? Number(form.price) : undefined, yearCreated: form.yearCreated ? Number(form.yearCreated) : undefined })
                  toast.success('Guardado como rascunho')
                  router.push('/dashboard/artworks')
                } catch { toast.error('Erro') }
                setSaving(false)
              }} disabled={saving} className="w-full py-2.5 border border-gray-200 text-gray-500 hover:border-gray-300 font-bold text-sm rounded-xl transition-colors">
                💾 Guardar como rascunho
              </button>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-bold text-amber-600 text-center">
                📝 Este é um rascunho — não está visível publicamente
              </div>
            )}
            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
              <Save size={16} /> {saving ? 'A guardar…' : form.isDraft ? 'Publicar obra' : 'Guardar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
