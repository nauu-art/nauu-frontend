'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Users, ChevronDown } from 'lucide-react'
import api from '../../lib/api'
import { COORDS_CONCELHOS, DISTRITOS_CONCELHOS, getDistritoFromConcelho } from '../../lib/portugal'

// Coordenadas completas — distritos e concelhos de Portugal + cidades internacionais
const COORDS = {
  // Distritos
  'Aveiro': [40.6443, -8.6455],
  'Beja': [37.9641, -7.8731],
  'Braga': [41.5454, -8.4265],
  'Bragança': [41.8061, -6.7589],
  'Castelo Branco': [39.8219, -7.4930],
  'Coimbra': [40.2033, -8.4103],
  'Évora': [38.5742, -7.9079],
  'Faro': [37.0194, -7.9322],
  'Guarda': [40.5374, -7.2672],
  'Leiria': [39.7436, -8.8071],
  'Lisboa': [38.7169, -9.1399],
  'Portalegre': [39.2967, -7.4283],
  'Porto': [41.1579, -8.6291],
  'Santarém': [39.2369, -8.6870],
  'Setúbal': [38.5244, -8.8882],
  'Viana do Castelo': [41.6918, -8.8341],
  'Vila Real': [41.3004, -7.7457],
  'Viseu': [40.6566, -7.9122],
  // Concelhos — Lisboa
  'Amadora': [38.7533, -9.2300],
  'Cascais': [38.6979, -9.4215],
  'Lisboa, Lisboa': [38.7169, -9.1399],
  'Loures': [38.8312, -9.1683],
  'Mafra': [38.9344, -9.3317],
  'Odivelas': [38.7944, -9.1851],
  'Oeiras': [38.6969, -9.3148],
  'Sintra': [38.8029, -9.3817],
  'Vila Franca de Xira': [38.9546, -8.9856],
  // Concelhos — Porto
  'Gondomar': [41.1436, -8.5317],
  'Maia': [41.2333, -8.6167],
  'Matosinhos': [41.1833, -8.6833],
  'Porto, Porto': [41.1579, -8.6291],
  'Póvoa de Varzim': [41.3833, -8.7667],
  'Valongo': [41.1833, -8.4833],
  'Vila do Conde': [41.3500, -8.7500],
  'Vila Nova de Gaia': [41.1333, -8.6167],
  // Concelhos — Braga
  'Barcelos': [41.5333, -8.6167],
  'Braga, Braga': [41.5454, -8.4265],
  'Esposende': [41.5333, -8.7833],
  'Guimarães': [41.4425, -8.2919],
  'Famalicão': [41.4000, -8.5167],
  'Vila Nova de Famalicão': [41.4000, -8.5167],
  // Concelhos — Aveiro
  'Aveiro, Aveiro': [40.6443, -8.6455],
  'Espinho': [41.0119, -8.6419],
  'Ovar': [40.8667, -8.6333],
  'Santa Maria da Feira': [40.9269, -8.5447],
  'São João da Madeira': [40.9017, -8.4917],
  // Concelhos — Coimbra
  'Coimbra, Coimbra': [40.2033, -8.4103],
  'Figueira da Foz': [40.1500, -8.8667],
  'Lousã': [40.1000, -8.2500],
  'Montemor-o-Velho': [40.1667, -8.6833],
  // Concelhos — Setúbal
  'Almada': [38.6762, -9.1573],
  'Barreiro': [38.6606, -9.0725],
  'Moita': [38.6500, -8.9833],
  'Montijo': [38.7069, -8.9736],
  'Palmela': [38.5667, -8.9000],
  'Seixal': [38.6333, -9.1000],
  'Sesimbra': [38.4436, -9.1011],
  'Setúbal, Setúbal': [38.5244, -8.8882],
  // Concelhos — Faro (Algarve)
  'Albufeira': [37.0889, -8.2500],
  'Faro, Faro': [37.0194, -7.9322],
  'Lagos': [37.1019, -8.6731],
  'Loulé': [37.1417, -8.0244],
  'Olhão': [37.0272, -7.8417],
  'Portimão': [37.1361, -8.5378],
  'Silves': [37.1897, -8.4386],
  'Tavira': [37.1283, -7.6506],
  'Vila Real de Santo António': [37.1958, -7.4197],
  // Concelhos — Leiria
  'Alcobaça': [39.5500, -8.9833],
  'Batalha': [39.6572, -8.8258],
  'Caldas da Rainha': [39.4013, -9.1344],
  'Leiria, Leiria': [39.7436, -8.8071],
  'Marinha Grande': [39.7467, -8.9319],
  'Nazaré': [39.6019, -9.0717],
  'Peniche': [39.3558, -9.3808],
  // Concelhos — Santarém
  'Abrantes': [39.4614, -8.1981],
  'Almeirim': [39.2119, -8.6319],
  'Entroncamento': [39.4681, -8.4681],
  'Santarém, Santarém': [39.2369, -8.6870],
  'Tomar': [39.6036, -8.4119],
  'Torres Novas': [39.4806, -8.5392],
  // Concelhos — Viana do Castelo
  'Arcos de Valdevez': [41.8500, -8.4167],
  'Ponte de Lima': [41.7667, -8.5833],
  'Viana do Castelo, Viana do Castelo': [41.6918, -8.8341],
  // Concelhos — Viseu
  'Lamego': [41.0983, -7.8094],
  'Viseu, Viseu': [40.6566, -7.9122],
  // Concelhos — Vila Real
  'Chaves': [41.7397, -7.4706],
  'Vila Real, Vila Real': [41.3004, -7.7457],
  // Ilhas
  'Ponta Delgada': [37.7412, -25.6756],
  'Angra do Heroísmo': [38.6542, -27.2197],
  'Funchal': [32.6669, -16.9241],
  // Internacional
  'Madrid': [40.4168, -3.7038],
  'Barcelona': [41.3851, 2.1734],
  'Paris': [48.8566, 2.3522],
  'London': [51.5074, -0.1278],
  'Berlin': [52.5200, 13.4050],
  'Amsterdam': [52.3676, 4.9041],
  'São Paulo': [-23.5505, -46.6333],
  'Rio de Janeiro': [-22.9068, -43.1729],
  'Belo Horizonte': [-19.9167, -43.9345],
  'New York': [40.7128, -74.0060],
  'Los Angeles': [34.0522, -118.2437],
}

// Distritos de Portugal para agrupamento
const DISTRITOS = ['Aveiro','Beja','Braga','Bragança','Castelo Branco','Coimbra','Évora','Faro','Guarda','Leiria','Lisboa','Portalegre','Porto','Santarém','Setúbal','Viana do Castelo','Vila Real','Viseu']

const getCoords = (city) => {
  if (COORDS_CONCELHOS[city]) return COORDS_CONCELHOS[city]
  if (!city) return null
  if (COORDS[city]) return COORDS[city]
  // Tentar match parcial
  const key = Object.keys(COORDS).find(k => k.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(k.toLowerCase()))
  return key ? COORDS[key] : null
}

const getDistrito = (city) => {
  if (!city) return 'Internacional'
  const d = getDistritoFromConcelho(city)
  return d || 'Internacional'
}

export default function MapaClient() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [selectedDistrito, setSelectedDistrito] = useState(null)
  const [MapComponents, setMapComponents] = useState(null)
  const [view, setView] = useState('map') // 'map' | 'list'

  useEffect(() => {
    api.get('/artists?limit=500').then(res => {
      setArtists(res.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))

    import('leaflet').then(L => {
      import('react-leaflet').then(RL => {
        delete L.default.Icon.Default.prototype._getIconUrl
        L.default.Icon.Default.mergeOptions({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })
        setMapComponents({ L: L.default, ...RL })
      })
    })
  }, [])

  // Agrupar por cidade com coordenadas
  const byCity = artists.reduce((acc, a) => {
    if (!a.city) return acc
    const coords = getCoords(a.city)
    if (!coords) return acc
    if (!acc[a.city]) acc[a.city] = { coords, artists: [], distrito: getDistrito(a.city) }
    acc[a.city].artists.push(a)
    return acc
  }, {})

  // Agrupar por distrito
  const byDistrito = artists.reduce((acc, a) => {
    if (!a.city) return acc
    const coords = getCoords(a.city)
    if (!coords) return acc
    const d = getDistrito(a.city)
    if (!acc[d]) acc[d] = []
    acc[d].push(a)
    return acc
  }, {})

  const totalCities = Object.keys(byCity).length
  const totalDistritos = Object.keys(byDistrito).filter(d => d !== 'Internacional').length

  const filteredArtists = selectedDistrito
    ? byDistrito[selectedDistrito] || []
    : selected
    ? byCity[selected]?.artists || []
    : []

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 md:px-10 py-6 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-end gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-1" style={{letterSpacing:'-0.03em'}}>
            Mapa de artistas
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            {artists.length} artistas · {totalCities} cidades · {totalDistritos} distritos
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setView('map')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${view === 'map' ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500'}`}>
            🗺 Mapa
          </button>
          <button onClick={() => setView('list')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${view === 'list' ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-500'}`}>
            📋 Lista
          </button>
          <Link href="/artists" className="text-sm font-bold text-blue-500 hover:text-blue-600 ml-2">
            Ver lista de artistas →
          </Link>
        </div>
      </div>

      {view === 'map' ? (
        <div className="flex flex-col md:flex-row" style={{height: 'calc(100dvh - 140px)'}}>
          {/* Mapa */}
          <div className="flex-1 relative min-h-0">
            {!MapComponents ? (
              <div className="flex items-center justify-center h-full bg-blue-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <MapComponents.MapContainer center={[39.5, -8]} zoom={7} style={{ height: '100%', width: '100%' }}>
                  <MapComponents.TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {Object.entries(byCity).map(([city, data]) => (
                    <MapComponents.Marker key={city} position={data.coords}
                      eventHandlers={{ click: () => { setSelected(city); setSelectedDistrito(null) } }}>
                      <MapComponents.Popup>
                        <div style={{fontFamily:'Nunito,sans-serif',minWidth:'180px'}}>
                          <div style={{fontWeight:800,fontSize:'14px',marginBottom:'4px',color:'#111'}}>{city}</div>
                          <div style={{fontSize:'11px',color:'#888',marginBottom:'8px'}}>{data.distrito} · {data.artists.length} artista{data.artists.length !== 1 ? 's' : ''}</div>
                          {data.artists.slice(0,4).map(a => (
                            <a key={a.id} href={`/${a.username}`}
                              style={{display:'flex',alignItems:'center',gap:'8px',padding:'4px 0',borderTop:'1px solid #f0f0f0',textDecoration:'none',color:'#111'}}>
                              <div style={{width:'28px',height:'28px',borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                {a.user?.avatarUrl
                                  ? <img src={a.user.avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                                  : <span style={{fontSize:'12px',fontWeight:800,color:'#1A7FD4'}}>{a.artistName?.[0]}</span>}
                              </div>
                              <span style={{fontSize:'12px',fontWeight:600}}>{a.artistName}</span>
                            </a>
                          ))}
                          {data.artists.length > 4 && (
                            <div style={{fontSize:'11px',color:'#1A7FD4',marginTop:'6px',fontWeight:700}}>+{data.artists.length - 4} mais</div>
                          )}
                        </div>
                      </MapComponents.Popup>
                    </MapComponents.Marker>
                  ))}
                </MapComponents.MapContainer>
              </>
            )}
          </div>

          {/* Painel lateral */}
          <div className="w-full md:w-72 h-48 md:h-auto border-t md:border-t-0 md:border-l border-gray-100 bg-white overflow-auto flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-300 mb-2">
                {selected ? byCity[selected]?.distrito : selectedDistrito ? selectedDistrito : 'Distritos'}
              </div>
              {(selected || selectedDistrito) && (
                <button onClick={() => { setSelected(null); setSelectedDistrito(null) }}
                  className="text-xs font-bold text-blue-500 hover:text-blue-600">
                  ← Ver todos
                </button>
              )}
            </div>

            {!selected && !selectedDistrito ? (
              <div className="flex-1 overflow-auto">
                {/* Distritos portugueses */}
                <div className="px-3 py-2 text-xs font-extrabold uppercase tracking-widest text-gray-300">Portugal</div>
                {Object.entries(byDistrito)
                  .filter(([d]) => d !== 'Internacional')
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([distrito, artistsList]) => (
                    <button key={distrito} onClick={() => setSelectedDistrito(distrito)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900">{distrito}</div>
                        <div className="text-xs text-gray-400 font-medium">{artistsList.length} artista{artistsList.length !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="text-xs font-extrabold text-blue-400">{artistsList.length}</div>
                    </button>
                  ))}
                {byDistrito['Internacional']?.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-extrabold uppercase tracking-widest text-gray-300 border-t border-gray-100 mt-1">Internacional</div>
                    <button onClick={() => setSelectedDistrito('Internacional')}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-900">Internacional</div>
                        <div className="text-xs text-gray-400 font-medium">{byDistrito['Internacional'].length} artistas</div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            ) : selectedDistrito && !selected ? (
              // Lista de cidades do distrito
              <div className="flex-1 overflow-auto">
                <div className="px-3 py-2 text-xs font-extrabold uppercase tracking-widest text-gray-300">Concelhos</div>
                {Object.entries(byCity)
                  .filter(([_, data]) => data.distrito === selectedDistrito)
                  .sort((a, b) => b[1].artists.length - a[1].artists.length)
                  .map(([city, data]) => (
                    <button key={city} onClick={() => setSelected(city)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 text-left">
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-900">{city}</div>
                        <div className="text-xs text-gray-400">{data.artists.length} artista{data.artists.length !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="text-xs font-extrabold text-blue-400">{data.artists.length}</div>
                    </button>
                  ))}
                {/* Artistas do distrito sem cidade específica */}
              </div>
            ) : (
              // Lista de artistas da cidade
              <div className="flex-1 overflow-auto">
                <div className="px-3 py-2 text-xs font-extrabold uppercase tracking-widest text-gray-300">
                  {selected} · {byCity[selected]?.artists.length} artistas
                </div>
                {filteredArtists.map(a => (
                  <Link href={`/${a.username}`} key={a.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0">
                      {a.user?.avatarUrl
                        ? <img src={a.user.avatarUrl} className="w-full h-full object-cover" />
                        : <span className="text-blue-400 font-extrabold text-sm">{a.artistName?.[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">{a.artistName}</div>
                      <div className="text-xs text-blue-400 font-semibold">{a.categories?.[0]?.category?.name || 'Artista'}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Vista de lista por distrito
        <div className="px-5 md:px-10 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(byDistrito)
              .filter(([d]) => d !== 'Internacional')
              .sort((a, b) => b[1].length - a[1].length)
              .map(([distrito, artistsList]) => (
                <div key={distrito} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-blue-400" />
                      <span className="text-sm font-extrabold text-gray-900">{distrito}</span>
                    </div>
                    <span className="text-xs font-bold text-blue-400">{artistsList.length}</span>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    {artistsList.slice(0, 4).map(a => (
                      <Link href={`/${a.username}`} key={a.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0">
                          {a.user?.avatarUrl
                            ? <img src={a.user.avatarUrl} className="w-full h-full object-cover" />
                            : <span className="text-blue-400 font-extrabold text-xs">{a.artistName?.[0]}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">{a.artistName}</div>
                          <div className="text-xs text-gray-400">{a.city}</div>
                        </div>
                      </Link>
                    ))}
                    {artistsList.length > 4 && (
                      <div className="text-xs font-bold text-blue-500 px-2 py-1">+{artistsList.length - 4} mais artistas</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
