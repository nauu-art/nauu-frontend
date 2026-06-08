import Link from 'next/link'
import DOMPurify from 'isomorphic-dompurify'
import { notFound } from 'next/navigation'

async function getPost(slug) {
  try {
    const res = await fetch(`http://localhost:3001/api/admin/content/blog_${slug}`, {
      next: { revalidate: 60 }
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.key) return data
    }
  } catch {}
  return null
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post não encontrado' }
  return { title: `${post.title} | nauu.art Blog` }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link href="/blog" className="text-sm font-bold text-gray-400 hover:text-gray-600 mb-8 block">← Blog</Link>
        <div className="text-xs text-gray-400 font-medium mb-4">
          {new Date(post.updatedAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8" style={{letterSpacing:'-0.03em'}}>{post.title}</h1>
        {post.imageUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden aspect-video">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="text-gray-600 font-medium leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content?.replace(/\n\n/g, '</p><p class="mb-4">').replace(/^/, '<p class="mb-4">').replace(/$/, '</p>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>').replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>') || '') }} />
        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between">
          <Link href="/blog" className="text-sm font-bold text-gray-400 hover:text-gray-600">← Todos os artigos</Link>
          <Link href="/explore" className="text-sm font-bold text-blue-500 hover:text-blue-600">Explorar obras →</Link>
        </div>
      </div>
    </div>
  )
}
