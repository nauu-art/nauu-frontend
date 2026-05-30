export default function ArtistAvatar({ src, name, size = 9 }) {
  const s = `w-${size} h-${size}`
  return (
    <div className={`${s} rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0`}>
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : <span className="text-blue-400 font-extrabold text-sm">{name?.[0]}</span>}
    </div>
  )
}
