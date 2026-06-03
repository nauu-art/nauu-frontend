'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useLocale } from '../../context/LocaleContext'
import Newsletter from '../ui/Newsletter'

const LANGS = [
  { code: 'pt', flag: '🇵🇹', label: 'Português' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
]

export default function Footer() {
  const { t, locale, changeLocale: setLocale } = useLocale()
  const [langOpen, setLangOpen] = useState(false)

  return (
    <footer className="border-t border-gray-100 px-5 md:px-10 py-8 pb-8 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
        <div className="max-w-xs">
          <Link href="/"><img src="/logo.svg" alt="nauu.art" className="h-7 w-auto mb-3" /></Link>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">{t('footer.tagline')}</p>
        </div>
        <div className="flex gap-12 flex-wrap">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-3">{t('footer.explore')}</div>
            <div className="flex flex-col gap-2">
              <Link href="/explore" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">{t('nav.explore')}</Link>
              <Link href="/artists" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">{t('nav.artists')}</Link>
              <Link href="/feed" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">Feed</Link>
              <Link href="/curated" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">Curated</Link>
              <Link href="/map" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">{t('footer.map')}</Link>
            </div>
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-3">{t('footer.about')}</div>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">{t('footer.about_us')}</Link>
              <Link href="/how-it-works" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">{t('footer.how_it_works')}</Link>
              <Link href="/blog" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">Blog</Link>
              <Link href="/feedback" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">{t('footer.feedback')}</Link>
              <Link href="/donate" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">{t('footer.donate')}</Link>
            </div>
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-3">{t('footer.legal')}</div>
            <div className="flex flex-col gap-2">
              <Link href="/termos" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">{t('footer.terms')}</Link>
              <Link href="/privacidade" className="text-sm text-gray-400 font-medium hover:text-gray-700 transition-colors">{t('footer.privacy')}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-gray-100 pt-8 pb-6">
        <Newsletter compact />
      </div>

      <div className="border-t border-gray-100 pt-5 mb-16 md:mb-0 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="text-xs text-gray-300 font-medium">© {new Date().getFullYear()} nauu.art — {t('footer.copyright')}</div>
        <div className="relative">
          <button onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:border-gray-300 transition-colors">
            {LANGS.find(l => l.code === locale)?.flag} {LANGS.find(l => l.code === locale)?.label}
            <span className="text-gray-300">▾</span>
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-[45]" onClick={() => setLangOpen(false)} />
              <div className="absolute bottom-10 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-[80] overflow-hidden w-40">
                {LANGS.map(lang => (
                  <button key={lang.code} onClick={() => { setLocale(lang.code); setLangOpen(false) }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors ${locale === lang.code ? 'text-blue-500' : 'text-gray-600'}`}>
                    {lang.flag} {lang.label}
                    {locale === lang.code && <span className="ml-auto text-blue-400 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </footer>
  )
}
