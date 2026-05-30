'use client'
import { useLocale } from '../../context/LocaleContext'

const colorMap = {
  AVAILABLE: '#2ECC71',
  RESERVED: '#F39C12',
  SOLD: '#E74C3C',
}

export default function AvailabilityBadge({ availability, className = '' }) {
  const { t } = useLocale()
  const color = colorMap[availability] || '#999'
  const label = availability === 'AVAILABLE'
    ? t('artwork.available')
    : availability === 'RESERVED'
    ? t('artwork.reserved')
    : t('artwork.sold')

  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${className}`} style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
      {label}
    </span>
  )
}
