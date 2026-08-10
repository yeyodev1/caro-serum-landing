import type { Product } from '@/types/landing'
import {
  comboDobleImage, comboTrioImage, eyelinerImage, maskHeroBanner,
  maskProductImage, serum10Image, serum5Image,
} from '@/config/images'

// Los precios viven en centavos y deben coincidir con PRODUCTS en
// serum-backapp/src/services/order.service.ts, que es la fuente de verdad.
export const products: Product[] = [
  { id: 'serum-10ml', name: 'OMG Lashes 10 ml', detail: 'Tratamiento de 3 a 5 meses', price: 3500, size: '10 ml', image: serum10Image },
  { id: 'serum-5ml', name: 'OMG Lashes 5 ml', detail: 'Tratamiento de 1 a 2 meses', price: 2000, size: '5 ml', image: serum5Image },
  { id: 'eyeliner-2in1', name: 'Delineador 2 en 1', detail: 'Crece mientras te maquillas', price: 2000, size: 'Serum + liner', image: eyelinerImage },
]

export const combos: Product[] = [
  { id: 'combo-doble', name: 'Combo Doble Crecimiento · Ahorra $6', detail: '10 ml + 5 ml', price: 4900, size: 'Ahorra $6', image: comboDobleImage },
  { id: 'combo-trio', name: 'Trío Completo · Ahorra $16', detail: '10 ml + 5 ml + delineador 2en1', price: 5900, size: 'Más vendido · Ahorra $16', image: comboTrioImage },
  { id: 'combo-trio-masks', name: 'Trío + 5 Mascarillas · Rutina Completa', detail: '10 ml + 5 ml + delineador + 5 mascarillas de colágeno', price: 6900, size: 'Mejor Valor · Rutina Completa', image: maskHeroBanner },
]

export const masks: Product[] = [
  { id: 'collagen-mask-1', name: 'Mascarilla de colágeno', detail: '1 unidad', price: 250, size: '1 mascarilla', image: maskProductImage },
  { id: 'collagen-mask-5', name: 'Mascarilla de colágeno (Pack de 5)', detail: 'Pack de 5 unidades', price: 990, size: 'Pack de 5', image: maskProductImage },
  { id: 'collagen-mask-10', name: 'Mascarilla de colágeno (Pack de 10)', detail: 'Pack de 10 unidades', price: 1500, size: 'Pack de 10', image: maskProductImage },
]

// Precio tachado que se muestra junto a cada combo.
export const comboCompareAt: Record<string, string> = {
  'combo-doble': '$55',
  'combo-trio': '$75',
  'combo-trio-masks': '$90',
}

export const featuredComboIds = ['combo-trio', 'combo-trio-masks']

export const instagramUrl = 'https://www.instagram.com/omglashes.ec/'
export const cartStorageKey = 'omg-lashes-cart'

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
