import Link from 'next/link'
import { UserPlus, Image, Mail, Search, Heart, MessageSquare, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Como Funciona | nauu.art',
  description: 'Descobre como funciona o nauu.art — para artistas e para compradores.',
}

export default function ComoFuncionaPage() {
  const stepsArtist = [
    { icon: UserPlus, n: '01', title: 'Cria o teu perfil', desc: 'Regista-te gratuitamente como artista. Define o teu nome artístico, bio, especialidades, localização e redes sociais.' },
    { icon: Image, n: '02', title: 'Publica as tuas obras', desc: 'Adiciona as tuas criações com fotos, título, técnica, dimensões e preço. Ou marca como "preço sob consulta". Sem limites.' },
    { icon: Mail, n: '03', title: 'Recebe contactos', desc: 'Quando alguém está interessado, recebes um email com os dados do interessado. Respondes diretamente. Sem comissões.' },
  ]

  const stepsBuyer = [
    { icon: Search, n: '01', title: 'Explora o catálogo', desc: 'Navega por obras de artistas de todo o mundo. Filtra por categoria, técnica, preço ou localização do artista.' },
    { icon: Heart, n: '02', title: 'Guarda os teus favoritos', desc: 'Cria uma conta gratuita para guardar obras na tua wishlist e acompanhar os teus artistas preferidos.' },
    { icon: MessageSquare, n: '03', title: 'Contacta o artista', desc: 'Entra em contacto diretamente através do formulário. O artista responde ao teu email. Negociam entre si.' },
  ]

  const faqs = [
    { q: 'O nauu.art é gratuito?', a: 'Sim, totalmente gratuito para artistas e para visitantes. Não cobramos comissões nem taxas de transação.' },
    { q: 'Posso processar pagamentos pelo nauu.art?', a: 'Ainda não. Nesta fase, o nauu.art serve para conectar artistas e compradores. O pagamento é acordado e feito diretamente entre as partes.' },
    { q: 'Que tipo de arte posso publicar?', a: 'Qualquer tipo de arte com valor artístico: pintura, fotografia, escultura, arte digital, ilustração, cerâmica, joalharia, e muito mais.' },
    { q: 'Como funciona o contacto?', a: 'Quando um visitante clica em "Contactar artista", preenche um formulário com nome, email e mensagem. O artista recebe essa mensagem por email e responde diretamente.' },
    { q: 'Posso vender arte internacional?', a: 'Sim! O nauu.art está disponível para artistas e compradores de qualquer país. A plataforma está disponível em português, inglês e espanhol.' },
    { q: 'Como destaco o meu perfil?', a: 'Preenche o teu perfil completo com bio, foto, capa e categorias. Obras com fotos de qualidade têm mais visibilidade no catálogo.' },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-50 to-white border-b border-gray-100 px-10 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-3">Guia rápido</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-3" style={{letterSpacing:'-0.03em'}}>
            Como funciona o nauu.art
          </h1>
          <p className="text-gray-500 font-medium text-sm leading-relaxed">
            Simples para artistas. Simples para compradores. Sempre gratuito.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-10 py-16">

        {/* Tabs artista / comprador */}
        <div className="grid grid-cols-2 gap-8 mb-16">

          {/* Para artistas */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white text-lg">🎨</div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400">Para artistas</div>
                <div className="text-lg font-extrabold text-gray-900 tracking-tight">Mostra o teu trabalho</div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {stepsArtist.map(s => (
                <div key={s.n} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <s.icon size={15} className="text-blue-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-extrabold text-blue-300">{s.n}</span>
                      <span className="text-sm font-extrabold text-gray-900">{s.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/register" className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              Registar como artista →
            </Link>
          </div>

          {/* Para compradores */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">🛒</div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Para compradores</div>
                <div className="text-lg font-extrabold text-gray-900 tracking-tight">Descobre arte única</div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {stepsBuyer.map(s => (
                <div key={s.n} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                      <s.icon size={15} className="text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-extrabold text-gray-300">{s.n}</span>
                      <span className="text-sm font-extrabold text-gray-900">{s.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/explore" className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-500 font-bold text-sm rounded-xl transition-colors">
              Explorar obras →
            </Link>
          </div>
        </div>

        {/* O que está incluído */}
        <div className="bg-blue-50 rounded-2xl p-8 mb-16">
          <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-4 text-center">O que está incluído — gratuitamente</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Perfil de artista completo',
              'Upload ilimitado de obras',
              'Fotos comprimidas automaticamente',
              'Formulário de contacto',
              'Notificações por email',
              'Dashboard com métricas',
              'URL personalizado nauu.art/o-teu-nome',
              'Visibilidade no catálogo',
              'Pesquisa e filtros',
              'Lista de favoritos',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="text-center mb-8">
            <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">Dúvidas frequentes</div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900" style={{letterSpacing:'-0.025em'}}>Perguntas & Respostas</h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map(faq => (
              <div key={faq.q} className="border border-gray-100 rounded-xl p-5">
                <div className="text-sm font-extrabold text-gray-900 mb-2">{faq.q}</div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center mt-16 pt-10 border-t border-gray-100">
          <p className="text-gray-400 font-medium text-sm mb-4">Ainda tens dúvidas?</p>
          <div className="flex gap-3 justify-center">
            <Link href="/feedback" className="px-4 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:border-blue-300 hover:text-blue-500 transition-colors">
              Fala connosco
            </Link>
            <Link href="/register" className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
