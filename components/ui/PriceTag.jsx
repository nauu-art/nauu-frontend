'use client'
import { useLocale } from '../../context/LocaleContext'

export default function PriceTag({ price, priceOnRequest, className = '' }) {
  const { t } = useLocale()
  const label = priceOnRequest || !price
    ? t('artwork.on_request')
    : `€ ${Number(price).toLocaleString('pt-PT')}`
  return <span className={className}>{label}</span>
}
