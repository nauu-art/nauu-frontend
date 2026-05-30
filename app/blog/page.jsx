import Link from 'next/link'

async function getPosts() {
  try {
    const res = await fetch('http://localhost:3001/api/admin/blog', {
      next: { revalidate: 60 }
    })
    if (res.ok) return await res.json()
  } catch {}
  return []
}

export const metadata = {
  title: 'Blog | nauu.art',
  description: 'Histórias de artistas, tendências e inspiração do mundo da arte.',
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 md:px-10 py-12 border-b border-gray-100">
        <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">Editorial</div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2" style={{letterSpacing:'-0.03em'}}>Blog</h1>
        <p className="text-gray-500 font-medium text-sm">Histórias de artistas, tendências e inspiração.</p>
      </div>
      <div className="px-5 md:px-10 py-10">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-300 font-bold text-lg">Em breve...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map(post => {
              const slug = post.key.replace('blog_', '')
              return (
                <Link href={`/blog/${slug}`} key={post.key}
                  className="group border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors">
                  <div className="h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                    {post.imageUrl
                      ? <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                      : <span className="text-5xl">🎨</span>}
                  </div>
                  <div className="p-5">
                    <h2 className="text-base font-extrabold text-gray-900 mb-2 group-hover:text-blue-500 transition-colors">{post.title}</h2>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3">{post.content?.slice(0, 150)}...</p>
                    <div className="text-xs text-gray-400 font-medium mt-3">
                      {new Date(post.updatedAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
