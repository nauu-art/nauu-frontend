'use client'
import { useState, useEffect } from 'react'
import { DISTRITOS_CONCELHOS } from '../../lib/portugal'

const PAISES = [
  // Europa
  'Portugal', 'Espanha', 'França', 'Reino Unido', 'Alemanha', 'Itália',
  'Países Baixos', 'Bélgica', 'Suíça', 'Áustria', 'Suécia', 'Noruega',
  'Dinamarca', 'Finlândia', 'Polónia', 'República Checa', 'Hungria',
  'Roménia', 'Grécia', 'Croácia', 'Sérvia', 'Ucrânia', 'Irlanda',
  // Américas
  'Brasil', 'Estados Unidos', 'Canada', 'México', 'Argentina', 'Chile',
  'Colômbia', 'Peru', 'Venezuela', 'Equador', 'Bolívia', 'Uruguai',
  // África
  'Angola', 'Moçambique', 'Cabo Verde', 'São Tomé e Príncipe',
  'Guiné-Bissau', 'África do Sul', 'Marrocos', 'Nigéria', 'Quénia',
  // Ásia
  'China', 'Japão', 'India', 'Coreia do Sul', 'Turquia', 'Israel',
  'Emirados Árabes Unidos', 'Tailândia', 'Indonésia', 'Singapura',
  // Oceânia
  'Austrália', 'Nova Zelândia',
  // Outro
  'Outro'
]

export default function LocationPicker({ city, country, onChange, className = '' }) {
  const [pais, setPais] = useState(country || 'Portugal')
  const [distrito, setDistrito] = useState('')
  const [concelho, setConcelho] = useState(city || '')

  const distritos = Object.keys(DISTRITOS_CONCELHOS)
  const concelhos = distrito ? DISTRITOS_CONCELHOS[distrito] || [] : []

  useEffect(() => {
    if (city && country === 'Portugal') {
      // Tentar encontrar o distrito a partir do concelho
      for (const [d, cs] of Object.entries(DISTRITOS_CONCELHOS)) {
        if (cs.includes(city) || d === city) { setDistrito(d); break }
      }
      setConcelho(city)
    }
  }, [city, country])

  const handlePais = (p) => {
    setPais(p)
    setDistrito('')
    setConcelho('')
    onChange({ city: '', country: p })
  }

  const handleDistrito = (d) => {
    setDistrito(d)
    setConcelho('')
    onChange({ city: d, country: 'Portugal' })
  }

  const handleConcelho = (c) => {
    setConcelho(c)
    onChange({ city: c, country: 'Portugal' })
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div>
        <label className="label">País</label>
        <select value={pais} onChange={e => handlePais(e.target.value)} className="input">
          {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {pais === 'Portugal' && (
        <>
          <div>
            <label className="label">Distrito</label>
            <select value={distrito} onChange={e => handleDistrito(e.target.value)} className="input">
              <option value="">Seleciona o distrito</option>
              {distritos.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {distrito && (
            <div>
              <label className="label">Concelho</label>
              <select value={concelho} onChange={e => handleConcelho(e.target.value)} className="input">
                <option value="">Seleciona o concelho</option>
                {concelhos.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </>
      )}

      {pais !== 'Portugal' && (
        <div>
          <label className="label">Cidade</label>
          <input value={concelho} onChange={e => { setConcelho(e.target.value); onChange({ city: e.target.value, country: pais }) }}
            className="input" placeholder="A tua cidade" />
        </div>
      )}
    </div>
  )
}
