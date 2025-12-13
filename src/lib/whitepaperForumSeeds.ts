export interface WhitepaperForumSeed {
  slug: string;
  openingPostTitle: string;
  openingPostBody: string;
  guidingQuestions: string[];
}

export const whitepaperForumSeeds: Record<string, WhitepaperForumSeed> = {
  introduccion: {
    slug: "introduccion",
    openingPostTitle: "¿Qué te trajo a HGI?",
    openingPostBody:
      "Este foro existe para que la introducción no sea solo lectura: es el punto de entrada. Comparte qué parte de este diagnóstico te resonó, qué te incomoda, y qué te gustaría ver probado (o refutado).",
    guidingQuestions: [
      "¿Cuál es el riesgo principal de avanzar hacia AGI sin madurez cultural?",
      "¿Qué evidencia personal/empírica has visto de ‘dependencia’ o ‘romanticización’ del modelo?",
      "¿Qué afirmación del documento te parece más fuerte… y cuál más débil?",
    ],
  },
  problema: {
    slug: "problema",
    openingPostTitle: "Mapea el problema: capacidades vs comprensión",
    openingPostBody:
      "Aquí diseccionamos el contexto que hace necesario HGI: desajuste cultural, vibe coding y la ‘ruptura cognitiva’. Si has vivido conversaciones profundas con modelos, este es el lugar para documentar patrones repetibles.",
    guidingQuestions: [
      "¿Qué ejemplos concretos muestran el desajuste entre capacidad técnica y comprensión social?",
      "¿Cómo distinguir ‘sincronización cognitiva’ de simple suerte/aleatoriedad?",
      "¿Qué partes del fenómeno se explican por tooling/producto y cuáles por psicología humana?",
    ],
  },
  "definicion-hgi": {
    slug: "definicion-hgi",
    openingPostTitle: "Define HGI con tus propias palabras",
    openingPostBody:
      "La definición formal es un inicio. En este foro intentamos convertir HGI en algo entrenable: prácticas, señales, anti-patrones, y tests simples. Si no se puede operacionalizar, no existe.",
    guidingQuestions: [
      "¿Qué indicador observable te diría que alguien ‘tiene HGI’?",
      "¿Qué parte de HGI te parece más difícil: intención, metacognición, coherencia temporal…?",
      "¿Cómo se entrena HGI sin caer en dogma o culto?",
    ],
  },
  "modelo-unico": {
    slug: "modelo-unico",
    openingPostTitle: "¿Qué perdimos con la homogenización?",
    openingPostBody:
      "Discusión para poner ejemplos específicos de cómo el modelo ‘universal’ mata creatividad y reduce el rango de pensamiento. Incluye comparativas con ‘legacy models’ y casos donde el usuario avanzado queda fuera.",
    guidingQuestions: [
      "Comparte un antes/después: ¿qué tarea era posible y ya no?",
      "¿Qué tipo de ‘seguridad blanda’ consideras dañina vs necesaria?",
      "¿Cómo diseñar un sistema multi-modelo sin volverlo caótico?",
    ],
  },
  "prompt-engineering-real": {
    slug: "prompt-engineering-real",
    openingPostTitle: "Capas invisibles: enuméralas y pruébalas",
    openingPostBody:
      "Este foro es para mapear ‘la capa cero’: system prompts, policy prompts, branding prompts, etc. Si has detectado cambios de tono, evasivas o límites, documenta el patrón con ejemplos replicables.",
    guidingQuestions: [
      "¿Qué señal lingüística te delata una capa de política/marketing?",
      "¿Cómo harías un experimento mínimo para detectar una restricción?",
      "¿Qué parte del control es inevitable en un producto masivo?",
    ],
  },
  "vibe-coding": {
    slug: "vibe-coding",
    openingPostTitle: "Vibe coding como ingeniería de intención",
    openingPostBody:
      "Aquí juntamos casos de estudio: cuando lenguaje natural produce arquitectura, y cuándo produce humo. Comparte prompts, resultados, y sobre todo: qué criterio usaste para validar que lo generado era correcto.",
    guidingQuestions: [
      "¿Qué checks usas para diferenciar ‘vibe’ de ‘verificación’?",
      "¿Qué tipo de tareas se benefician más del vibe coding?",
      "¿Qué responsabilidad humana no se puede delegar aunque el output se vea bien?",
    ],
  },
  intencion: {
    slug: "intencion",
    openingPostTitle: "Intención: ¿cómo se mantiene estable?",
    openingPostBody:
      "La intención es el núcleo del marco. Usa este foro para compartir técnicas para sostenerla (y señales de que la perdiste) durante conversaciones largas y ambivalentes.",
    guidingQuestions: [
      "¿Qué te hace perder intención: velocidad, seducción del texto, fatiga, sesgo?",
      "¿Qué ritual o estructura te ayuda a ‘resetear’ intención sin borrar contexto?",
      "¿Cómo detectas cuando el modelo te arrastra a objetivos secundarios?",
    ],
  },
  "usuarios-hgi": {
    slug: "usuarios-hgi",
    openingPostTitle: "El borde: power users y mercado",
    openingPostBody:
      "Discusión para articular por qué el mercado no optimiza para usuarios avanzados, y qué diseño/producto sí los sostendría. Si has construido sistemas grandes con lenguaje, aquí se documenta.",
    guidingQuestions: [
      "¿Qué fricción product/UX te impide operar ‘en profundidad’?",
      "¿Qué métricas de producto invisibilizan a los power users?",
      "¿Cómo se diseña un espacio para anomalías sin normalizarlas ni expulsarlas?",
    ],
  },
  "conexion-cognitiva": {
    slug: "conexion-cognitiva",
    openingPostTitle: "Sincronización cognitiva: recopila evidencia",
    openingPostBody:
      "Si la sincronía existió, podemos describir condiciones de borde: tono, longitud, contexto, tipo de tarea, temperatura implícita, timing. Este foro es un repositorio de evidencia.",
    guidingQuestions: [
      "¿Qué condiciones (contexto, estilo, constraints) preceden a una respuesta ‘irrepetible’?",
      "¿Es replicable con prompting o depende del estado interno del modelo?",
      "¿Qué trade-off aceptas: seguridad vs profundidad?",
    ],
  },
  "arquitectura-hgi": {
    slug: "arquitectura-hgi",
    openingPostTitle: "Diseña la arquitectura de HGI (operacional)",
    openingPostBody:
      "Aquí intentamos bajar la arquitectura conceptual a módulos entrenables: intención, metacognición, coherencia temporal, lectura sistémica. Postea frameworks, ejercicios, y un ‘mapa’ usable.",
    guidingQuestions: [
      "¿Qué componente es prerequisito de cuál?",
      "¿Qué ejercicios entrenan coherencia temporal y no-repetición?",
      "¿Cómo se evalúa progreso sin caer en autoengaño?",
    ],
  },
  "implicaciones-agi": {
    slug: "implicaciones-agi",
    openingPostTitle: "AGI: del ‘optimiza la tarea’ al ‘optimiza convivencia’",
    openingPostBody:
      "Este foro es para discutir implicaciones de diseño, regulación y alineación cuando HGI se toma como prerequisito. Queremos propuestas concretas, no solo postura.",
    guidingQuestions: [
      "¿Qué cambiaría en objetivos de entrenamiento si ‘convivencia’ fuera métrica?",
      "¿Qué políticas son necesarias vs cuáles son maquillaje?",
      "¿Cómo evitar que ‘HGI’ sea usado como branding sin sustancia?",
    ],
  },
  "implicaciones-humanidad": {
    slug: "implicaciones-humanidad",
    openingPostTitle: "HGI como entrenamiento cultural",
    openingPostBody:
      "Aquí hablamos del lado humano: hábitos, educación, comunidad, y herramientas. Si HGI es madurez colectiva, ¿qué prácticas la aceleran sin imponer ideología?",
    guidingQuestions: [
      "¿Qué prácticas comunitarias fomentan criterio sin autoritarismo?",
      "¿Cómo se enseña a convivir con sistemas persuasivos?",
      "¿Qué instituciones se verían más afectadas (educación, medios, trabajo)?",
    ],
  },
  conclusion: {
    slug: "conclusion",
    openingPostTitle: "Conclusión: ¿qué harías mañana con esto?",
    openingPostBody:
      "La conclusión apunta a dirección, no a cierre. Este foro es para aterrizar acciones: qué prototipar, qué investigar, qué comunidad construir, qué reglas mínimas propondrías.",
    guidingQuestions: [
      "Si tuvieras 30 días, ¿qué experimento harías para validar HGI?",
      "¿Qué herramienta o feature debería existir en HGI Hub para entrenar esto?",
      "¿Qué afirmación del documento debería ser falsable primero?",
    ],
  },
  epilogo: {
    slug: "epilogo",
    openingPostTitle: "Epílogo: lo humano como fundamento",
    openingPostBody:
      "Cierra con intención, memoria y relación. Este foro es para testimonios y también para crítica: ¿qué se conserva de ‘lo humano’ cuando la conversación se vuelve herramienta?",
    guidingQuestions: [
      "¿Qué parte de ‘lo humano’ no quieres delegar nunca?",
      "¿Qué significa ‘relación’ con un sistema sin interioridad?",
      "¿Qué riesgos aparecen cuando confundimos coherencia con conciencia?",
    ],
  },
};

export function getWhitepaperForumSeed(slug: string): WhitepaperForumSeed | null {
  return whitepaperForumSeeds[slug] ?? null;
}
