export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/dashboard/', '/admin', '/admin/', '/account/', '/api/'],
      },
    ],
    sitemap: 'https://nauu.art/sitemap.xml',
    host: 'https://nauu.art',
  }
}
