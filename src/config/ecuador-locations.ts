// Lista de respaldo: el selector usa ecuadorCantons.ts y cae aquí si falta una provincia.
// Las claves deben coincidir exactamente con las de ecuadorCantonsByProvince.
export const provinces = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
  'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas',
  'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe',
]

export const citiesByProvince: Record<string, string[]> = {
  Azuay: ['Cuenca', 'Gualaceo', 'Paute', 'Giron', 'Sigsig'], Bolívar: ['Guaranda', 'San Miguel', 'Chillanes', 'Chimbo'], Cañar: ['Azogues', 'Cañar', 'La Troncal', 'El Tambo'], Carchi: ['Tulcan', 'San Gabriel', 'El Angel', 'Huaca'], Chimborazo: ['Riobamba', 'Alausi', 'Guamote', 'Guano'], Cotopaxi: ['Latacunga', 'La Mana', 'Pujili', 'Salcedo', 'Saquisili'], 'El Oro': ['Machala', 'Santa Rosa', 'Pasaje', 'Huaquillas', 'Arenillas'], Esmeraldas: ['Esmeraldas', 'Atacames', 'Quininde', 'Muisne'], Galápagos: ['Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil'], Guayas: ['Guayaquil', 'Duran', 'Samborondon', 'Milagro', 'Daule', 'Playas'], Imbabura: ['Ibarra', 'Otavalo', 'Atuntaqui', 'Cotacachi'], Loja: ['Loja', 'Catamayo', 'Cariamanga', 'Macara'], 'Los Ríos': ['Babahoyo', 'Quevedo', 'Vinces', 'Buena Fe'], Manabí: ['Portoviejo', 'Manta', 'Chone', 'Jipijapa', 'Montecristi'], 'Morona Santiago': ['Macas', 'Gualaquiza', 'Sucua', 'Limon Indanza'], Napo: ['Tena', 'Archidona', 'El Chaco', 'Quijos'], Orellana: ['Puerto Francisco de Orellana', 'La Joya de los Sachas', 'Loreto', 'Aguarico'], Pastaza: ['Puyo', 'Mera', 'Santa Clara', 'Arajuno'], Pichincha: ['Quito', 'Cayambe', 'Mejia', 'Ruminahui', 'Pedro Moncayo', 'Puerto Quito'], 'Santa Elena': ['Santa Elena', 'La Libertad', 'Salinas'], 'Santo Domingo de los Tsáchilas': ['Santo Domingo', 'La Concordia'], Sucumbíos: ['Nueva Loja', 'Shushufindi', 'Lago Agrio', 'Cascales'], Tungurahua: ['Ambato', 'Banos de Agua Santa', 'Pelileo', 'Quero'], 'Zamora Chinchipe': ['Zamora', 'Yantzaza', 'El Pangui', 'Zumba'],
}
