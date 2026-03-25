import type { NewsCategory } from '../types/types';

export interface AnalysisFactor {
  factor: string;
  score: number;
  status: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  source: string;
  date: string;
  category: Exclude<NewsCategory, 'all'>;
  credibilityScore: number;
  content?: string;
  analysis: AnalysisFactor[];
}

// Análisis estándar para noticias reales (medios verificados)
const defaultRealNewsAnalysis: AnalysisFactor[] = [
  {
    factor: 'Verificación de Fuente',
    score: 95,
    status: 'positive',
    description: 'Medio de comunicación establecido y reconocido con proceso editorial.'
  },
  {
    factor: 'Precisión Factual',
    score: 92,
    status: 'positive',
    description: 'Información y eventos reportados de manera consistente con otros medios.'
  },
  {
    factor: 'Credibilidad del Autor',
    score: 90,
    status: 'positive',
    description: 'Publicado por periodistas o autores validados del medio.'
  },
  {
    factor: 'Detección de Sesgo',
    score: 85,
    status: 'neutral',
    description: 'El contenido presenta el encuadre editorial y de opinión esperado para su formato.'
  }
];

export const mockNewsData: NewsArticle[] = [
    {
    id: '405638016',
    title: 'Límites al poder',
    description: 'La estrategia de seguridad del Gobierno federal y la resiliencia de la ciudadanía fueron puestas a prueba ayer...',
    imageUrl: 'https://www.gruporeforma.com/opinion/Autor/Sharing/1610_perfilNRM.jpg?ts=20260223084917',
    source: 'El Norte',
    date: '23 Feb, 2026',
    category: 'real',
    credibilityScore: 91,
    content: '<p class="mb-4">La estrategia de seguridad del Gobierno federal y la resiliencia de la ciudadanía fueron puestas a prueba ayer. La realidad volvió a recordarnos que el combate a la inseguridad, el mantenimiento del Estado de Derecho y la capacidad real de los Gobiernos de gobernar son la piedra angular...</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405638012',
    title: 'Realidad regia',
    description: 'Ves jugar a las Chivas, aunque hayan perdido contra Cruz Azul, y te das cuenta de que Tigres y Rayados, por ahora, no tienen nada qué hacer en este torneo...',
    imageUrl: 'https://www.gruporeforma.com/opinion/Editorial/Sharing/83_perfilNRM.jpg?ts=20260223084618',
    source: 'El Norte',
    date: '23 Feb, 2026',
    category: 'fake',
    credibilityScore: 55,
    content: '<p class="mb-4">Ves jugar a las Chivas, aunque hayan perdido contra Cruz Azul, y te das cuenta de que Tigres y Rayados, por ahora, no tienen nada qué hacer en este torneo. Lo mismo al ver a La Máquina y Toluca. Es justo que los clubes regios estén en octavo y noveno lugar. Todos los que están...</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405611898',
    title: 'Cabeza de la hidra',
    description: '"Esta serpiente parecía destinada a la eternidad... A la última cabeza, que era inmortal, Hércules la enterró bajo una gran piedra..."',
    imageUrl: 'https://www.gruporeforma.com/opinion/Autor/Sharing/548_perfilNRM.jpg?ts=20260223072719',
    source: 'Reforma',
    date: '23 Feb, 2026',
    category: 'fake',
    credibilityScore: 35,
    content: '<p class="mb-4">"Esta serpiente parecía destinada a la eternidad... A la última cabeza, que era inmortal, Hércules la enterró bajo una gran piedra, y donde la enterraron estará ahora, odiando y soñando". Jorge Luis Borges La muerte de Nemesio Oseguera, El Mencho, es...</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405611896',
    title: 'La batalla impostergable',
    description: 'La muerte de la cabeza de la organización criminal más poderosa de México deja constancia de la determinación de la presidenta Sheinbaum...',
    imageUrl: 'https://www.gruporeforma.com/opinion/Autor/Sharing/492_perfilNRM.jpg?ts=20260223072719',
    source: 'Reforma',
    date: '23 Feb, 2026',
    category: 'misleading',
    credibilityScore: 73,
    content: '<p class="mb-4">La muerte de la cabeza de la organización criminal más poderosa de México deja constancia de la determinación de la presidenta Sheinbaum de poner fin a los apapachos que su antecesor ofrecía a los criminales. En la demagogia del populista, los criminales eran víctimas de un modelo económico. Los...</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405611892',
    title: 'Pisar mercurio',
    description: 'Hay que decirlo sin mezquindad: la caída de Nemesio Oseguera Cervantes, El Mencho, es un golpe mayor...',
    imageUrl: 'https://www.gruporeforma.com/opinion/Autor/Sharing/463_perfilNRM.jpg?ts=20260223072502',
    source: 'Reforma',
    date: '23 Feb, 2026',
    category: 'real',
    credibilityScore: 92,
    content: '<p class="mb-4">Hay que decirlo sin mezquindad: la caída de Nemesio Oseguera Cervantes, El Mencho, es un golpe mayor. Un trofeo que el Estado mexicano llevaba años persiguiendo. Un mensaje -hacia adentro y hacia afuera- de que la era de "abrazos, no balazos" ya no alcanza para administrar un país capturado por...</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405611890',
    title: 'La educación como impulso para la prosperidad nacional',
    description: 'Las instituciones educativas tenemos una responsabilidad permanente: formar a personas en entornos diversos, dinámicos e inciertos...',
    imageUrl: 'https://www.gruporeforma.com/opinion/Autor/Sharing/1818_perfilNRM.jpg?ts=20260223072503',
    source: 'Reforma',
    date: '23 Feb, 2026',
    category: 'real',
    credibilityScore: 90,
    content: '<p class="mb-4">Las instituciones educativas tenemos una responsabilidad permanente: formar a personas en entornos diversos, dinámicos e inciertos, buscando que tengan un impacto positivo en la sociedad. En años recientes hemos visto la coincidencia de muchos retos que no sólo han modificado el mundo laboral y...</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405611888',
    title: 'Tapalpa',
    description: 'Es un golpe que mira hacia atrás y abre grietas hacia adelante. Es, en el presente, la acción gubernamental de seguridad más importante...',
    imageUrl: 'https://www.gruporeforma.com/opinion/Autor/Sharing/541_perfilNRM.jpg?ts=20260223072507',
    source: 'Reforma',
    date: '23 Feb, 2026',
    category: 'real',
    credibilityScore: 89,
    content: '<p class="mb-4">Es un golpe que mira hacia atrás y abre grietas hacia adelante. Es, en el presente, la acción gubernamental de seguridad más importante. Un golpe de autoridad política. El operativo militar para la captura de El Mencho que terminó en su muerte se une al collar de decisiones de distinto nivel que...</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405607928',
    title: 'La educación como impulso para la prosperidad nacional',
    description: 'Las instituciones educativas tenemos una responsabilidad permanente: formar a personas en entornos diversos, dinámicos e inciertos...',
    imageUrl: 'https://www.gruporeforma.com/opinion/Autor/Sharing/1818_perfilNRM.jpg?ts=20260223071447',
    source: 'El Norte',
    date: '23 Feb, 2026',
    category: 'real',
    credibilityScore: 90,
    content: '<p class="mb-4">Las instituciones educativas tenemos una responsabilidad permanente: formar a personas en entornos diversos, dinámicos e inciertos, buscando que tengan un impacto positivo en la sociedad. En años recientes hemos visto la coincidencia de muchos retos que no sólo han modificado el mundo laboral y...</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405592674',
    title: 'Entre asombro y la conciencia de lo no perfecto se encuentran mis opciones y la realidad',
    description: '¿Te has puesto a contemplar lo que te asombra en la vida? Esta mañana pensé que la vida es muy grande. Al decirlo me salieron lágrimas...',
    imageUrl: 'https://vanguardia.com.mx/binrepository/1200x675/0c0/0d0/down-right/11604/ECEV/diseno-sin-titulo-11_1-14563997_20260222224047.jpg',
    source: 'Vanguardia',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 85,
    content: '<p class="mb-4">¿Te has puesto a contemplar lo que te asombra en la vida? Esta mañana pensé que la vida es muy grande. Al decirlo me salieron lágrimas. ¿Qué sentí? ¿Por qué las lágrimas? ¿Qué es lo que sentimos en esos momentos? No es miedo, ni ira, ni dolor... ¿Entonces? Logré nombrar compasión y ternura, alegría muy profunda. Cuestioné el merecimiento, mi merecimiento. No considero que exista alguna razón por la que yo merecería la grandeza de la vida que no sea la sola habilidad de contemplarla.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405561206',
    title: 'Morena: referente inmoral de la sociedad',
    description: 'Durante el gobierno de López Obrador se especulaba que, probablemente, cuando dejara la presidencia brotarían varios conflictos dentro de Morena...',
    imageUrl: 'https://etcetera.com.mx/wp-content/uploads/2026/02/440ac1674f87cec10b829bce70fac432.jpg',
    source: 'Etcétera',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 87,
    content: '<p class="mb-4">Durante el gobierno de López Obrador se especulaba que, probablemente, cuando dejara la presidencia brotarían varios conflictos dentro de Morena, pues por más influencia política que conservara desde Palenque le sería difícil evitar esas confrontaciones y rivalidades.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405561200',
    title: '¿México necesita a un Bukele?',
    description: '¿México necesita a un Bukele? La sola pregunta revela el tamaño de la frustración y decepción nacional frente a la inseguridad, la corrupción...',
    imageUrl: 'https://etcetera.com.mx/wp-content/uploads/2026/02/descarga-13.webp',
    source: 'Etcétera',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 86,
    content: '<p class="mb-4">¿México necesita a un Bukele? La sola pregunta revela el tamaño de la frustración y decepción nacional frente a la inseguridad, la corrupción y la incompetencia institucional acumuladas por décadas.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405542316',
    title: 'Se reporta llegada de restos de \'El Mencho\' a la FEMDO',
    description: 'Los restos del capo Nemesio Oseguera Cervantes, alias \'El Mencho\', abatido este domingo en la Sierra de Jalisco, se encuentran en la FEMDO...',
    imageUrl: 'https://img.gruporeforma.com/imagenes/960x640/7/131/6130631.jpg',
    source: 'El Norte',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 94,
    content: '<p class="mb-4">Los restos del capo Nemesio Oseguera Cervantes, alias \'El Mencho\', abatido este domingo en la Sierra de Jalisco, se encuentran en la Fiscalía Especializada en materia de Delincuencia Organizada (FEMDO), en la Ciudad de México, de acuerdo con los primeros reportes.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405513414',
    title: 'Muere \'El Mencho\' camino a CDMX tras operativo en Jalisco',
    description: 'Nemesio Oseguera Cervantes, "El Mencho", fue detenido en Tapalpa, Jalisco, donde fue herido durante un operativo federal desplegado...',
    imageUrl: 'https://img.gruporeforma.com/imagenes/960x640/7/131/6130528.jpg',
    source: 'Reforma',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 95,
    content: '<p class="mb-4">Nemesio Oseguera Cervantes, "El Mencho", fue detenido en Tapalpa, Jalisco, donde fue herido durante un operativo federal desplegado, y perdió la vida en camino a la Ciudad de México, confirmó la Secretaría de la Defensa Nacional.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405472342',
    title: 'Analizan pobreza en municipios mineros del estado',
    description: 'Actividad extractiva no se traduce en desarrollo económico, revela estudio...',
    imageUrl: 'https://diario.mx/core/dmx/assets/images/2026/02/22/20211007120032-0-1849121-pk4w7xx8a-rJtLPHnC8.jpg',
    source: 'El Diario de Juárez',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 93,
    content: '<p class="mb-4">Ciudad Juárez.- Localidades mineras de la entidad, como Guadalupe y Calvo y Guazapares, son muestra de que dicha actividad extractiva no se traduce en desarrollo económico ni bienestar para las comunidades.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405472332',
    title: 'Recibió Chihuahua más fondos del Repuve',
    description: 'Superó a Tamaulipas y Baja California...',
    imageUrl: 'https://diario.mx/core/dmx/assets/images/2026/02/22/untitled-1-hsho0wo4n-Ll7vlHMdI.jpg',
    source: 'El Diario de Juárez',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 93,
    content: '<p class="mb-4">Ciudad Juárez.- Un análisis del Legislativo federal muestra que Chihuahua fue el estado que mayor cantidad de recursos recibió para pavimentación derivados de la regularización de vehículos de procedencia extranjera.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405460070',
    title: 'Venderán como chatarra 60 camiones de PASA',
    description: 'De 92 unidades, sólo cuatro son usadas por la Dirección de Limpia; otras fueron donadas...',
    imageUrl: 'https://diario.mx/core/dmx/assets/images/2026/02/22/9-bkSk6mdZr.jpg',
    source: 'El Diario de Juárez',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 90,
    content: '<p class="mb-4">Ciudad Juárez.- De los 92 camiones recolectores de basura que la empresa PASA cedió al Municipio al término de su contrato en 2023, la mayoría se rematará como chatarra, dio a conocer la directora de Patrimonio Municipal, Jessica Karina Espino López.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405460064',
    title: 'Será el martes elección en el Campestre',
    description: 'Entre pugna legal, el club emitió una segunda convocatoria con fecha para votar por nuevo Consejo de Directores...',
    imageUrl: 'https://diario.mx/core/dmx/assets/images/2026/02/22/untitled-1-izT6id3Jd.jpg',
    source: 'El Diario de Juárez',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 89,
    content: '<p class="mb-4">Ciudad Juárez.- En medio de la pugna legal por la renovación de la dirigencia, el Club Campestre de Ciudad Juárez emitió una segunda convocatoria que ya establece formalmente la fecha para la elección del nuevo Consejo de Directores.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405452588',
    title: 'Abaten a Nemesio Oseguera Cervantes, “El Mencho”',
    description: 'El líder del Cártel de Jalisco Nueva Generación (CJNG), Nemesio Oseguera Cervantes, alias “El Mencho”, fue abatido el domingo 22 de febrero...',
    imageUrl: 'https://8columnas.com.mx/wp-content/uploads/2024/01/8Columnas-Home_bl.png',
    source: 'Ocho Columnas',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 93,
    content: '<p class="mb-4">El líder del Cártel de Jalisco Nueva Generación (CJNG), Nemesio Oseguera Cervantes, alias “El Mencho”, fue abatido el domingo 22 de febrero durante un operativo encabezado por fuerzas federales en el municipio de Tapalpa, Jalisco, confirmaron fuentes del Gobierno de México.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405452586',
    title: 'San Mateo Atenco inaugura rehabilitación de avenida Benito Juárez',
    description: 'La presidenta municipal de San Mateo Atenco, Ana Muñiz Neyra, encabezó la inauguración de la rehabilitación de la avenida Benito Juárez García...',
    imageUrl: 'https://8columnas.com.mx/wp-content/uploads/2024/01/8Columnas-Home_bl.png',
    source: 'Ocho Columnas',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 88,
    content: '<p class="mb-4">La presidenta municipal de San Mateo Atenco, Ana Muñiz Neyra, encabezó la inauguración de la rehabilitación de la avenida Benito Juárez García, luego de concluir las primeras dos etapas de pavimentación con concreto hidráulico en la principal vía de acceso del municipio.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405452584',
    title: 'UAEMéx destaca saber indígena y “milpas educativas” en Día de la Lengua Materna',
    description: 'En el marco del Día Internacional de la Lengua Materna, la Facultad de Ciencias de la Conducta de la Universidad Autónoma del Estado de México...',
    imageUrl: 'https://8columnas.com.mx/wp-content/uploads/2024/01/8Columnas-Home_bl.png',
    source: 'Ocho Columnas',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 91,
    content: '<p class="mb-4">En el marco del Día Internacional de la Lengua Materna, la Facultad de Ciencias de la Conducta de la Universidad Autónoma del Estado de México (UAEMéx) realizó la conferencia “El conocimiento indígena para la educación escolar: Aportes desde las ‘Milpas educativas’ para el buen vivir”.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405452582',
    title: 'CODHEM intensifica recorridos para proteger derechos de personas migrantes',
    description: 'En lo que va de 2026, la Comisión de Derechos Humanos del Estado de México (CODHEM) ha llevado a cabo 12 recorridos en distintos municipios...',
    imageUrl: 'https://8columnas.com.mx/wp-content/uploads/2024/01/8Columnas-Home_bl.png',
    source: 'Ocho Columnas',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 92,
    content: '<p class="mb-4">En lo que va de 2026, la Comisión de Derechos Humanos del Estado de México (CODHEM) ha llevado a cabo 12 recorridos en distintos municipios con presencia de población en movilidad, con el propósito de brindar asesoría e informar sobre sus derechos.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405452580',
    title: 'Toluca despliega 400 elementos por peregrinación al Tepeyac',
    description: 'El Gobierno de Toluca implementará un operativo integrado por 400 elementos para acompañar a los contingentes que avanzarán hacia la Basílica de Guadalupe...',
    imageUrl: 'https://8columnas.com.mx/wp-content/uploads/2026/02/Toluca-despliega-400-elementos-por-peregrinacion-al-Tepeyac.jpg',
    source: 'Ocho Columnas',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 90,
    content: '<p class="mb-4">El Gobierno de Toluca implementará un operativo integrado por 400 elementos para acompañar a los contingentes que avanzarán hacia la Basílica de Guadalupe con motivo de la Peregrinación al Tepeyac.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405452578',
    title: 'Ecatepec refuerza recolección nocturna gratuita de basura',
    description: 'El Gobierno de Ecatepec fortaleció el programa de recolección nocturna gratuita de basura en zonas altas del municipio...',
    imageUrl: 'https://8columnas.com.mx/wp-content/uploads/2026/02/Ecatepec-refuerza-recoleccion-nocturna-gratuita-de-basura.jpg',
    source: 'Ocho Columnas',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 89,
    content: '<p class="mb-4">El Gobierno de Ecatepec fortaleció el programa de recolección nocturna gratuita de basura en zonas altas del municipio, con el objetivo de prevenir inundaciones y recuperar el espacio público. La alcaldesa Azucena Cisneros Coss supervisó el servicio en la Sierra de Guadalupe.</p>',
    analysis: defaultRealNewsAnalysis
  },
  {
    id: '405452574',
    title: 'Somos México avanza rumbo a su registro ante el INE',
    description: 'La organización civil Somos México llevó a cabo su asamblea nacional constitutiva como parte del proceso para obtener su registro como partido político...',
    imageUrl: 'https://8columnas.com.mx/wp-content/uploads/2024/01/8Columnas-Home_bl.png',
    source: 'Ocho Columnas',
    date: '22 Feb, 2026',
    category: 'real',
    credibilityScore: 92,
    content: '<p class="mb-4">La organización civil Somos México llevó a cabo su asamblea nacional constitutiva como parte del proceso para obtener su registro como partido político ante el Instituto Nacional Electoral (INE). En el acto se nombró a la dirigencia nacional, así como a los integrantes del consejo nacional.</p>',
    analysis: defaultRealNewsAnalysis
  }
];