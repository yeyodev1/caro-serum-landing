import { cld } from '@/config/images'

// Textos e imágenes de cada sección, tal como vienen en el deck de Carolina.

export const prostaglandinRisks = [
  'Irritación y enrojecimiento ocular',
  'Oscurecimiento del párpado',
  'Cambios en la pigmentación del iris',
  'Adelgazamiento de la piel del párpado',
]

export const omgBenefits = [
  'Sin análogos de prostaglandinas',
  'Con biotina, pantenol y péptidos',
  'Fortalece y nutre desde la raíz',
  'Textura ligera y libre de aceites',
  'Para cejas y pestañas',
]

export const applicationSteps = [
  { title: 'Limpia', detail: 'Asegúrate de que tus cejas y pestañas estén limpias y sin maquillaje.' },
  { title: 'Aplica en las cejas', detail: 'Pasa el cepillo como si estuvieras peinándolas.' },
  { title: 'Aplica en las pestañas', detail: 'Pasa la punta fina por fuera del ojo, sobre la línea superior de las pestañas.' },
  { title: 'Déjalo absorber', detail: 'Espera unos minutos antes de continuar tu rutina o maquillarte.' },
  { title: 'Repite', detail: 'Úsalo por la mañana y por la noche, todos los días.' },
]

// Slide 2 del deck: la foto de ojos + los dos chats, con sus mismos pies de foto.
export const beforeAfterGallery = [
  { url: cld('7f488247-9178-47ba-b1bd-ee40f03b8542', 720), title: 'Cliente OMGLASHES', subtitle: 'El cambio con su rutina diaria' },
  { url: cld('dc43b04f-1c5f-4bdd-a58a-a1b05686e577', 685), title: 'Cliente OMGLASHES', subtitle: 'Antes y después de uso constante' },
  { url: cld('d8a9c1fa-e17f-4854-a475-efdea70ef140', 720), title: 'Cliente OMGLASHES', subtitle: 'Pestañas más largas y fuertes' },
]

// Slide 7 del deck: antes/después + chat de Instagram + captura de WhatsApp.
export const chatTestimonials = [
  { url: cld('40516d16-0e91-4e7b-a18c-4099450116e2', 720), quote: '“Se siente ligero y no deja sensación grasosa.”', author: 'Compra verificada' },
  { url: cld('102c69b8-93a8-4c0d-b41c-e31eb279c518', 720), quote: '“La regla me ayudó a ser constante.”', author: 'Compra verificada' },
  { url: cld('394d81a0-7782-4f38-820e-bacfefb38c30', 720), quote: '“Lo uso también en mis cejas.”', author: 'Compra verificada' },
]

export const faqs = [
  { question: '¿Cuándo comenzaré a ver resultados?', answer: 'Puedes comenzar a observar cambios desde los 28 días. Cada persona es diferente y la constancia es fundamental.' },
  { question: '¿Cuántas veces al día debo utilizarlo?', answer: 'Por la mañana y por la noche, todos los días.' },
  { question: '¿Cómo se aplica en las cejas?', answer: 'Utiliza el cepillo tipo rímel y pásalo suavemente como si estuvieras peinándolas.' },
  { question: '¿Cómo se aplica en las pestañas?', answer: 'Utiliza la punta fina sobre la parte exterior de la línea superior de las pestañas. Evita aplicar el producto dentro del ojo.' },
  { question: '¿Puedo maquillarme después?', answer: 'Sí. Espera unos minutos hasta que el producto se absorba y luego continúa con tu maquillaje.' },
  { question: '¿Tiene aceites?', answer: 'No. Tiene una textura ligera y no deja sensación grasosa.' },
  { question: '¿Contiene análogos de prostaglandinas?', answer: 'No. OMGLASHES está libre de análogos de prostaglandinas.' },
  { question: '¿Realizan envíos a todo Ecuador?', answer: 'Sí. Realizamos envíos a todo Ecuador por Servientrega. Demora de 24 a 72 horas.' },
  { question: '¿Cómo reviso mi pedido?', answer: 'Ingresa a "Ya tengo mi pedido" en el menú superior y consulta su estado en cualquier momento con tu referencia o correo.' },
]
