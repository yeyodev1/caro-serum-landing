// Todas las imágenes salen del Drive de Carolina, subidas a Cloudinary en omglashes/landing-v2.
// El comentario indica en qué slide del deck aparece cada una.
//
// El ancho pedido nunca supera el ancho real del archivo: pedirle a Cloudinary más
// píxeles de los que tiene la fuente la reescala hacia arriba y se ve borrosa.
// Junto a cada constante va el tamaño del original como referencia.
import type { RetailerLogo } from '@/types/landing'

const BRIGHTNESS = 8

export const cld = (id: string, w: number) =>
  `https://res.cloudinary.com/dcoqwxbd/image/upload/f_auto,q_auto:good,e_brightness:${BRIGHTNESS},w_${w}/omglashes/landing-v2/${id}`

// slide 1 · collage del hero, completo y cuadrado como en el PPT (original 1254x1254).
// El marco es cuadrado a propósito: así entra el collage entero (las dos fotos y el
// panel del producto) sin cortar el texto impreso.
export const heroCollage = cld('efca4834-7822-4a7c-97d9-e9bad1d47391', 1254)
// slide 5 · 10 ml + 5 ml (original 1254x1254)
export const comboDobleImage = cld('ChatGPT_Image_6_ago_2026_12_41_38_a.m.', 1254)
// slide 5 · trío con delineador (original 1536x1024)
export const comboTrioImage = cld('ChatGPT_Image_6_ago_2026_12_38_26_a.m.', 1536)
// slide 12 · trío + mascarillas (original 1536x1024)
export const maskHeroBanner = cld('04e1538a-6e8e-412c-b0e9-f5aa92980061', 1536)
// slide 4 · productos individuales. Son las fotos exactas del deck, las que pidió
// Carolina; no están en Cloudinary ni en el Drive, sólo llegaron como recortes de
// ~195 px, así que viven en `public/productos/`.
// Ese ancho es el techo real: la tarjeta las muestra a 190 px como máximo porque
// estirarlas más las deja borrosas. Cuando lleguen los originales se sube el tope
// en `.product-image` de `_products.scss`.
export const serum10Image = '/productos/serum-10ml.jpg'
export const serum5Image = '/productos/serum-5ml.jpg'
export const eyelinerImage = '/productos/delineador-2en1.jpg'
// slide 6 · regla de progreso (original 1060x1061)
export const rulerImage = cld('20210713_120611', 1060)
// slide 10 · mascarilla de colágeno (original 980x1000)
export const maskProductImage = cld('61zG7fAVAoL._AC_UF1000_1000_QL80_', 980)
// slide 8 · recorte del PPT (original 752x762, no hay fuente mayor)
export const howToApplyImage = cld('como-aplicarlo', 752)
// slide 9 · puntos de venta. Ya no es el recorte del PPT (857x234, pixelado): cada
// logo se bajó del sitio oficial de la tienda y vive en `public/retailers/`, así que
// se ve nítido en pantallas 2x. `width` es el ancho óptico de cada uno en la barra;
// no son iguales porque el de Pharmacy's es una caja horizontal y el de Gloss es
// casi cuadrado.
export const retailerLogos: RetailerLogo[] = [
  { src: '/retailers/me-by-erika-velez.png', alt: 'ME by Erika Vélez', width: 140 },
  // El archivo oficial de Pharmacy's es el logo en blanco: va sobre su rojo de marca
  // (#8A000B, tomado de su propio header), igual que la caja roja del deck.
  { src: '/retailers/pharmacys.svg', alt: "Pharmacy's", width: 150, plate: '#8A000B' },
  { src: '/retailers/gloss-beauty-shop.png', alt: 'Gloss Beauty Shop', width: 84 },
]
