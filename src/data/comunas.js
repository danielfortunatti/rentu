export const comunasByRegion = [
  { region: 'Antofagasta', comunas: ['Antofagasta', 'Calama'] },
  { region: 'Araucanía', comunas: ['Padre Las Casas', 'Pucón', 'Temuco', 'Villarrica'] },
  { region: 'Arica y Parinacota', comunas: ['Arica'] },
  { region: 'Atacama', comunas: ['Copiapó', 'Vallenar'] },
  { region: 'Aysén', comunas: ['Coyhaique'] },
  { region: 'Biobío', comunas: ['Chillán', 'Concepción', 'Coronel', 'Hualpén', 'Los Ángeles', 'San Pedro de la Paz', 'Talcahuano'] },
  { region: 'Coquimbo', comunas: ['Coquimbo', 'La Serena', 'Ovalle'] },
  { region: 'Los Lagos', comunas: ['Castro', 'Osorno', 'Puerto Montt', 'Puerto Varas'] },
  { region: 'Los Ríos', comunas: ['Valdivia'] },
  { region: 'Magallanes', comunas: ['Punta Arenas'] },
  { region: 'Maule', comunas: ['Curicó', 'Linares', 'Talca'] },
  { region: 'Metropolitana', comunas: ['Buin', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Reina', 'Lampa', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Puente Alto', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San Miguel', 'Santiago Centro', 'Vitacura'] },
  { region: "O'Higgins", comunas: ['Machalí', 'Rancagua', 'San Fernando'] },
  { region: 'Tarapacá', comunas: ['Alto Hospicio', 'Iquique'] },
  { region: 'Valparaíso', comunas: ['Concón', 'Quilpué', 'Quillota', 'San Antonio', 'Valparaíso', 'Villa Alemana', 'Viña del Mar'] },
]

// Flat array for backwards compatibility
export const comunas = comunasByRegion.flatMap(r => r.comunas).sort((a, b) => a.localeCompare(b, 'es'))

export const tiposPropiedad = [
  'Departamento',
  'Casa',
  'Estudio',
  'Habitación',
  'Oficina',
  'Local comercial',
  'Bodega',
]

export const amenitiesEdificio = [
  { key: 'piscina', label: 'Piscina', icon: '🏊' },
  { key: 'gimnasio', label: 'Gimnasio', icon: '🏋️' },
  { key: 'quincho', label: 'Quincho/BBQ', icon: '🔥' },
  { key: 'salon_eventos', label: 'Salón de eventos', icon: '🎉' },
  { key: 'sala_cine', label: 'Sala de cine', icon: '🎬' },
  { key: 'juegos_infantiles', label: 'Juegos infantiles', icon: '🛝' },
  { key: 'lavanderia', label: 'Lavandería', icon: '🧺' },
  { key: 'bicicletero', label: 'Bicicletero', icon: '🚲' },
  { key: 'conserje', label: 'Conserje 24/7', icon: '🛡️' },
  { key: 'areas_verdes', label: 'Áreas verdes', icon: '🌳' },
  { key: 'cowork', label: 'Sala cowork', icon: '💻' },
  { key: 'rooftop', label: 'Rooftop/Terraza', icon: '🌇' },
]

export const cercaniasOptions = [
  { key: 'metro', label: 'Metro', icon: '🚇' },
  { key: 'paradero', label: 'Paradero de bus', icon: '🚌' },
  { key: 'supermercado', label: 'Supermercado', icon: '🛒' },
  { key: 'farmacia', label: 'Farmacia', icon: '💊' },
  { key: 'mall', label: 'Mall/Centro comercial', icon: '🏬' },
  { key: 'colegio', label: 'Colegio/Universidad', icon: '🎓' },
  { key: 'hospital', label: 'Hospital/Clínica', icon: '🏥' },
  { key: 'parque', label: 'Parque', icon: '🌿' },
  { key: 'restaurantes', label: 'Restaurantes', icon: '🍽️' },
  { key: 'banco', label: 'Banco', icon: '🏦' },
]

export const estadoPropiedad = [
  'Nuevo',
  'Remodelado',
  'Buen estado',
  'Usado',
]

export const amobladoOptions = [
  { value: '', label: 'Cualquiera' },
  { value: 'amoblado', label: 'Amoblado' },
  { value: 'semi', label: 'Semi-amoblado' },
  { value: 'sin', label: 'Sin amoblar' },
]
