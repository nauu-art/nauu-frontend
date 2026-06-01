export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/account/', '/onboarding', '/checkout/'],
      },
    ],
    sitemap: 'https://nauu.art/sitemap.xml',
  }
}
