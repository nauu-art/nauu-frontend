import Link from 'next/link'
import { Heart, Users, Image, Mail, Shield, Zap, Globe } from 'lucide-react'

export const metadata = {
  title: 'Sobre o nauu.art',
  description: 'Conheça o nauu.art — o marketplace de arte que conecta artistas e colecionadores portugueses e internacionais.',
}

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-50 to-white border-b border-gray-100 px-10 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4" style={{letterSpacing:'-0.03em'}}>
            Arte original,<br/>do <span className="text-blue-500">artista</span> para ti.
          </div>
          <p className="text-gray-500 font-medium leading-relaxed text-base">
            O nauu.art é um marketplace dedicado a artistas de todas as áreas criativas. Um espaço onde o trabalho fala por si e o contacto é direto.
          </p>
        </div>
      </div>

      {/* Missão */}
      <div className="max-w-3xl mx-auto px-10 py-16">
        <div className="grid grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-3">A nossa missão</div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-4" style={{letterSpacing:'-0.025em'}}>
              Aproximar artistas e colecionadores
            </h2>
            <p className="text-gray-500 font-medium leading-relaxed text-sm mb-4">
              Criámos o nauu.art porque acreditamos que comprar arte deve ser simples, direto e humano. Sem intermediários, sem comissões escondidas, sem burocracia.
            </p>
            <p className="text-gray-500 font-medium leading-relaxed text-sm">
              O artista publica o seu trabalho. O colecionador descobre-o. O contacto é feito diretamente. Simples assim.
            </p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-8 text-center">
            <div className="text-5xl font-extrabold text-blue-500 tracking-tight mb-2">100%</div>
            <div className="text-sm font-bold text-gray-600 mb-4">Sem comissões para o artista</div>
            <div className="text-4xl font-extrabold text-blue-400 tracking-tight mb-2">Direto</div>
            <div className="text-sm font-bold text-gray-600 mb-4">Contacto artista ↔ comprador</div>
            <div className="text-4xl font-extrabold text-blue-300 tracking-tight mb-2">🇵🇹</div>
            <div className="text-sm font-bold text-gray-600">Feito em Portugal</div>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-2">Os nossos valores</div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900" style={{letterSpacing:'-0.025em'}}>O que nos move</h2>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[
              { icon: Heart, color: 'bg-pink-50 text-pink-500', title: 'Arte para todos', desc: 'Acreditamos que a arte deve ser acessível. Qualquer artista, de qualquer área, pode publicar o seu trabalho gratuitamente.' },
              { icon: Users, color: 'bg-blue-50 text-blue-500', title: 'Comunidade primeiro', desc: 'Somos uma plataforma construída com e para artistas. O feedback da comunidade molda cada decisão que tomamos.' },
              { icon: Shield, color: 'bg-green-50 text-green-500', title: 'Transparência total', desc: 'Sem comissões escondidas, sem algoritmos opacos. O que vês é o que existe. Simples e honesto.' },
              { icon: Zap, color: 'bg-amber-50 text-amber-500', title: 'Contacto direto', desc: 'Eliminamos intermediários. Artista e comprador falam diretamente. A negociação e a relação são deles.' },
              { icon: Globe, color: 'bg-purple-50 text-purple-500', title: 'Portugal e o mundo', desc: 'Começámos em Portugal mas o nauu.art é para artistas de todo o mundo que queiram chegar a colecionadores portugueses e além.' },
              { icon: Image, color: 'bg-orange-50 text-orange-500', title: 'Qualidade acima de tudo', desc: 'Promovemos arte com valor. Cada obra publicada representa horas de trabalho, dedicação e expressão genuína.' },
            ].map(v => (
              <div key={v.title} className="border border-gray-100 rounded-xl p-5">
                <div className={`w-10 h-10 ${v.color} rounded-xl flex items-center justify-center mb-3`}>
                  <v.icon size={18} />
                </div>
                <div className="text-sm font-extrabold text-gray-900 mb-1.5">{v.title}</div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* História */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400 mb-3">A nossa história</div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 mb-4" style={{letterSpacing:'-0.025em'}}>Como surgiu o nauu.art</h2>
          <div className="space-y-4 text-sm text-gray-500 font-medium leading-relaxed">
            <p>O nauu.art nasceu de uma frustração simples: era demasiado complicado para artistas portugueses mostrarem e venderem o seu trabalho online. As plataformas existentes ou cobravam comissões elevadas, ou eram demasiado genéricas, ou simplesmente não falavam português.</p>
            <p>Decidimos criar algo diferente. Um espaço limpo, direto e gratuito, onde a arte é o centro de tudo. Onde um pintor de Lisboa consegue chegar a um colecionador no Porto — ou em São Paulo.</p>
            <p>Estamos ainda no início. Mas acreditamos que estamos a construir algo que faz falta.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center border border-blue-100 rounded-2xl p-10 bg-blue-50">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-3" style={{letterSpacing:'-0.025em'}}>
            Faz parte disto
          </h2>
          <p className="text-gray-500 font-medium text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Seja como artista a publicar o teu trabalho, ou como colecionador a descobrir arte — tens um lugar no nauu.art.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/register" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-colors">
              Criar conta gratuita
            </Link>
            <Link href="/explore" className="px-5 py-2.5 border border-blue-200 text-blue-500 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors">
              Explorar obras
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
