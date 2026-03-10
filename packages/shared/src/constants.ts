import type {
  NeurodivTypeValue,
  AnimationToleranceType,
  InfoDensityType,
  ContrastModeType,
  OnboardingStepType,
  ReactionTypeValue,
  SensoryPreset,
  FeedSortOption,
} from './types'

// ============================================================
// Battery Levels
// ============================================================

export const BATTERY_LEVELS = {
  GREEN: {
    key: 'GREEN' as const,
    label: 'Energia Alta',
    description: 'Disponible para interactuar, chatear y participar activamente',
    color: '#22c55e',
    bgColor: '#dcfce7',
    emoji: '\u{1F7E2}',
    deliveryMode: 'immediate' as const,
  },
  YELLOW: {
    key: 'YELLOW' as const,
    label: 'Energia Media',
    description: 'Disponible pero prefiero interacciones breves y tranquilas',
    color: '#eab308',
    bgColor: '#fef9c3',
    emoji: '\u{1F7E1}',
    deliveryMode: 'delayed' as const,
  },
  RED: {
    key: 'RED' as const,
    label: 'Energia Baja',
    description: 'Necesito espacio. Solo quiero observar sin presion',
    color: '#ef4444',
    bgColor: '#fee2e2',
    emoji: '\u{1F534}',
    deliveryMode: 'queued' as const,
  },
  LURKER: {
    key: 'LURKER' as const,
    label: 'Modo Fantasma',
    description: 'Invisible. Recargando bateria social en silencio',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    emoji: '\u{1F47B}',
    deliveryMode: 'rejected' as const,
  },
} as const

export type BatteryLevelKey = keyof typeof BATTERY_LEVELS
export type DeliveryMode = 'immediate' | 'delayed' | 'queued' | 'rejected'

// ============================================================
// Tone Tags
// ============================================================

export const TONE_TAGS = {
  ENTHUSIASM: {
    key: 'ENTHUSIASM' as const,
    label: 'Entusiasmo',
    emoji: '\u{2728}',
    color: '#F59E0B',
    description: 'Miren lo que descubri!',
  },
  RANT: {
    key: 'RANT' as const,
    label: 'Desahogo',
    emoji: '\u{1F32A}',
    color: '#8B5CF6',
    description: 'Necesito sacar esto',
  },
  DEBATE: {
    key: 'DEBATE' as const,
    label: 'Debate',
    emoji: '\u{1F4AC}',
    color: '#3B82F6',
    description: 'Quiero opiniones',
  },
  INFO_DUMP: {
    key: 'INFO_DUMP' as const,
    label: 'Info Dump',
    emoji: '\u{1F4DA}',
    color: '#10B981',
    description: 'Datos sobre mi hiperfoco',
  },
  QUESTION: {
    key: 'QUESTION' as const,
    label: 'Pregunta',
    emoji: '\u{1F4AC}',
    color: '#F97316',
    description: 'Necesito ayuda/info',
  },
  HELP: {
    key: 'HELP' as const,
    label: 'Ayuda',
    emoji: '\u{1F91D}',
    color: '#EC4899',
    description: 'Busco apoyo emocional',
  },
} as const

export type ToneTagKey = keyof typeof TONE_TAGS

// ============================================================
// Reaction Types (Phase 3) -- Neurodivergent-friendly
// ============================================================

export const REACTION_TYPES: Record<ReactionTypeValue, {
  key: ReactionTypeValue
  label: string
  emoji: string
  description: string
  color: string
}> = {
  SAME_HERE: {
    key: 'SAME_HERE',
    label: 'Yo tambien!',
    emoji: '\u{1F64B}',
    description: 'Me siento igual, no estas solo/a',
    color: '#3B82F6',
  },
  BRAIN_EXPLODE: {
    key: 'BRAIN_EXPLODE',
    label: 'Cerebro Explotado',
    emoji: '\u{1F92F}',
    description: 'Esto me volo la cabeza',
    color: '#8B5CF6',
  },
  HYPERFOCUS: {
    key: 'HYPERFOCUS',
    label: 'Hiperfoco Activado',
    emoji: '\u{1F3AF}',
    description: 'Ahora esto es mi nuevo hiperfoco',
    color: '#F59E0B',
  },
  SPOON_GIFT: {
    key: 'SPOON_GIFT',
    label: 'Te Regalo una Cuchara',
    emoji: '\u{1F944}',
    description: 'Toma energia, la necesitas (spoon theory)',
    color: '#10B981',
  },
  INFODUMP_THANKS: {
    key: 'INFODUMP_THANKS',
    label: 'Gracias por el Info Dump',
    emoji: '\u{1F4DA}',
    description: 'Amo que compartas lo que sabes',
    color: '#06B6D4',
  },
  HUG: {
    key: 'HUG',
    label: 'Abrazo Virtual',
    emoji: '\u{1FAC2}',
    description: 'Te mando un abrazo (si lo aceptas)',
    color: '#EC4899',
  },
  SENSORY_OVERLOAD: {
    key: 'SENSORY_OVERLOAD',
    label: 'Sobrecarga Sensorial',
    emoji: '\u{26A1}',
    description: 'Esto me genera mucho estimulo (no es malo, es info)',
    color: '#EF4444',
  },
}

// ============================================================
// Feed Configuration (Phase 3)
// ============================================================

export const FEED_SORT_OPTIONS: { key: FeedSortOption; label: string; description: string }[] = [
  {
    key: 'recent',
    label: 'Mas Recientes',
    description: 'Posts mas nuevos primero',
  },
  {
    key: 'trending',
    label: 'Tendencia',
    description: 'Lo que mas reacciones tiene ahora',
  },
  {
    key: 'hyperfocus_match',
    label: 'Mis Hiperfocos',
    description: 'Posts que coinciden con tus intereses actuales',
  },
  {
    key: 'spoon_friendly',
    label: 'Bajo Esfuerzo',
    description: 'Posts cortos y faciles de consumir (para dias de baja energia)',
  },
]

export const POST_LIMITS = {
  maxTitleLength: 150,
  maxContentLength: 10000,
  maxHyperfociPerPost: 5,
  infoDumpThreshold: 300, // words -- auto-mark as info dump
  tldrMinWords: 50, // Minimum words to show TL;DR button
  previewLength: 280, // Characters to show in feed card
  maxCommentLength: 2000,
  maxCommentDepth: 3, // Max nesting level for replies
} as const

export const FEED_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 50,
  infiniteScrollThreshold: 0.8, // Load more when 80% scrolled
  staleTime: 30 * 1000, // 30 seconds before refetch
  cacheTime: 5 * 60 * 1000, // 5 minutes cache
  // Dopamine curation weights
  dopamineWeights: {
    recency: 0.3,
    hyperfocusMatch: 0.35,
    novelty: 0.2,
    communityEngagement: 0.15,
  },
} as const

export const READING_CONFIG = {
  wordsPerMinute: 200, // Average reading speed
  bionicBoldRatio: 0.4, // Bold first 40% of each word
  bionicMinWordLength: 3, // Only apply bionic to words >= 3 chars
} as const

export const ANTI_RABBIT_HOLE_CONFIG = {
  checkIntervalMs: 15 * 60 * 1000, // Check every 15 min
  softNudgeMinutes: 30, // First nudge at 30 min
  mediumNudgeMinutes: 60, // Second nudge at 60 min
  strongNudgeMinutes: 90, // Strong nudge at 90 min
  messages: {
    soft: [
      'Llevas un rato aca. Tomaste agua?',
      'Recordatorio amable: tu cuerpo existe. Estiramiento rapido?',
      'Check-in: como va tu bateria social?',
    ],
    medium: [
      'Llevas 1 hora en el feed. Queres hacer una pausa?',
      'Tu cerebro merece un descanso. 5 minutos de nada?',
      'Idea: caminar al bano aunque no tengas ganas',
    ],
    strong: [
      'Llevas 90 min. Es mucho estimulo. Te sugiero cerrar un rato.',
      'Rabbit hole detectado. No pasa nada, pero tu yo del futuro te va a agradecer el break.',
      'Pausa obligatoria recomendada. Podes volver en 10 min.',
    ],
  },
} as const

// ============================================================
// Neurodiv Types
// ============================================================

export const NEURODIV_TYPES: Record<NeurodivTypeValue, { label: string; description: string }> = {
  ADHD_INATTENTIVE: { label: 'TDAH Inatento', description: 'Dificultad para mantener atencion, distraido/a facilmente' },
  ADHD_HYPERACTIVE: { label: 'TDAH Hiperactivo', description: 'Inquietud, necesidad de movimiento constante' },
  ADHD_COMBINED: { label: 'TDAH Combinado', description: 'Combinacion de inatento e hiperactivo' },
  AUTISM: { label: 'Autismo / TEA', description: 'Espectro autista' },
  DYSLEXIA: { label: 'Dislexia', description: 'Dificultad con lectura y procesamiento de texto' },
  DYSCALCULIA: { label: 'Discalculia', description: 'Dificultad con numeros y matematicas' },
  DYSPRAXIA: { label: 'Dispraxia', description: 'Dificultad con coordinacion motora' },
  TOURETTE: { label: 'Tourette', description: 'Tics motores o vocales' },
  OCD: { label: 'TOC', description: 'Pensamientos obsesivos y/o compulsiones' },
  BIPOLAR: { label: 'Bipolaridad', description: 'Cambios de estado de animo' },
  ANXIETY: { label: 'Ansiedad', description: 'Ansiedad generalizada o social' },
  DEPRESSION: { label: 'Depresion', description: 'Depresion clinica' },
  SENSORY_PROCESSING: { label: 'Procesamiento Sensorial', description: 'Sensibilidad sensorial atipica' },
  OTHER: { label: 'Otro', description: 'Otra condicion neurodivergente' },
  PREFER_NOT_TO_SAY: { label: 'Prefiero no decir', description: 'Y eso esta perfecto' },
}

// ============================================================
// Sensory Defaults & Presets
// ============================================================

export const SENSORY_DEFAULTS = {
  colorPalette: 'DEFAULT' as ContrastModeType,
  animationTolerance: 'MINIMAL' as AnimationToleranceType,
  informationDensity: 'COMFORTABLE' as InfoDensityType,
  transitionSpeed: 'normal',
  fontScale: 1.0,
  reducedMotion: true,
  bionicReadingEnabled: false,
  dyslexicFontEnabled: false,
  lineSpacing: 'normal',
  notificationIntensity: 'gentle',
  soundEnabled: false,
  hapticEnabled: true,
  activePreset: null as string | null,
} as const

export const SENSORY_PRESETS: SensoryPreset[] = [
  {
    key: 'calm',
    label: 'Calma Total',
    description: 'Minimo estimulo visual. Ideal para dias de baja energia.',
    config: {
      colorPalette: 'MUTED',
      animationTolerance: 'NONE',
      informationDensity: 'SPACIOUS',
      transitionSpeed: 'slow',
      fontScale: 1.1,
      reducedMotion: true,
      soundEnabled: false,
      notificationIntensity: 'silent',
    },
  },
  {
    key: 'focus',
    label: 'Modo Enfoque',
    description: 'Optimizado para hiperfoco. Menos distracciones, mas contenido.',
    config: {
      colorPalette: 'DARK_FOCUS',
      animationTolerance: 'MINIMAL',
      informationDensity: 'COMPACT',
      transitionSpeed: 'fast',
      fontScale: 1.0,
      reducedMotion: true,
      soundEnabled: false,
      notificationIntensity: 'silent',
    },
  },
  {
    key: 'high-energy',
    label: 'Alta Energia',
    description: 'Todo activado. Para cuando tu cerebro quiere estimulacion.',
    config: {
      colorPalette: 'DEFAULT',
      animationTolerance: 'FULL',
      informationDensity: 'COMFORTABLE',
      transitionSpeed: 'normal',
      fontScale: 1.0,
      reducedMotion: false,
      soundEnabled: true,
      hapticEnabled: true,
      notificationIntensity: 'moderate',
    },
  },
  {
    key: 'accessible',
    label: 'Accesibilidad Max',
    description: 'Alto contraste, fuente grande, lectura bionica. Para leer sin esfuerzo.',
    config: {
      colorPalette: 'HIGH',
      animationTolerance: 'NONE',
      informationDensity: 'SPACIOUS',
      transitionSpeed: 'slow',
      fontScale: 1.3,
      reducedMotion: true,
      bionicReadingEnabled: true,
      dyslexicFontEnabled: true,
      lineSpacing: 'relaxed',
      notificationIntensity: 'gentle',
    },
  },
]

export const COLOR_PALETTES: { key: ContrastModeType; label: string; description: string }[] = [
  { key: 'DEFAULT', label: 'Calma (Defecto)', description: 'Colores suaves y relajantes' },
  { key: 'HIGH', label: 'Alto Contraste', description: 'Maximo contraste para legibilidad' },
  { key: 'MUTED', label: 'Apagado', description: 'Tonos desaturados y suaves' },
  { key: 'DARK_FOCUS', label: 'Oscuro Enfocado', description: 'Modo oscuro con acentos minimos' },
]

export const ANIMATION_LEVELS: { key: AnimationToleranceType; label: string; description: string }[] = [
  { key: 'NONE', label: 'Sin Animaciones', description: 'Completamente estatico' },
  { key: 'MINIMAL', label: 'Minimo', description: 'Solo transiciones esenciales' },
  { key: 'MODERATE', label: 'Moderado', description: 'Animaciones sutiles' },
  { key: 'FULL', label: 'Completo', description: 'Todas las animaciones activas' },
]

export const DENSITY_LEVELS: { key: InfoDensityType; label: string; description: string }[] = [
  { key: 'COMPACT', label: 'Compacto', description: 'Mas contenido visible' },
  { key: 'COMFORTABLE', label: 'Comodo', description: 'Balance entre contenido y espacio' },
  { key: 'SPACIOUS', label: 'Espacioso', description: 'Mas espacio para respirar' },
]

// ============================================================
// Onboarding Config
// ============================================================

export const ONBOARDING_STEPS: { key: OnboardingStepType; label: string; description: string; stepNumber: number }[] = [
  { key: 'BASICS', label: 'Lo Basico', description: 'Username, pronombres, identificacion', stepNumber: 1 },
  { key: 'HYPERFOCI', label: 'Tus Hiperfocos', description: 'Que te apasiona ahora?', stepNumber: 2 },
  { key: 'SENSORY', label: 'Perfil Sensorial', description: 'Personaliza tu experiencia visual', stepNumber: 3 },
  { key: 'BATTERY_TUTORIAL', label: 'Bateria Social', description: 'Aprende a manejar tu energia', stepNumber: 4 },
]

export const AGE_RANGES = [
  { key: '13-17', label: '13-17' },
  { key: '18-24', label: '18-24' },
  { key: '25-34', label: '25-34' },
  { key: '35-44', label: '35-44' },
  { key: '45-54', label: '45-54' },
  { key: '55+', label: '55+' },
  { key: 'prefer-not', label: 'Prefiero no decir' },
]

export const PRONOUNS_OPTIONS = [
  { key: 'el/him', label: 'El / Him' },
  { key: 'ella/her', label: 'Ella / Her' },
  { key: 'elle/they', label: 'Elle / They' },
  { key: 'any', label: 'Cualquiera' },
  { key: 'custom', label: 'Personalizado' },
]

// ============================================================
// App Config
// ============================================================

export const APP_CONFIG = {
  name: 'HyperHub',
  tagline: 'Tu Espacio Seguro',
  description: 'Red social disenada para personas con TDAH',
  maxHyperfoci: 5, // Expanded from 3 in Phase 3
  maxBioLength: 500,
  maxDisplayNameLength: 50,
  maxHyperfocusHistory: 20,
  defaultBatteryLevel: 'GREEN' as const,
  batteryDecayDefaultMinutes: 120,
  batteryDelayYellowMs: 5 * 60 * 1000,
  version: '0.3.0', // Phase 3
} as const

// ============================================================
// Middleware Battery Config
// ============================================================

export const BATTERY_MIDDLEWARE_CONFIG = {
  GREEN: { action: 'deliver', delayMs: 0 },
  YELLOW: { action: 'delay', delayMs: 5 * 60 * 1000 },
  RED: { action: 'queue', delayMs: null },
  LURKER: { action: 'reject', delayMs: null },
} as const
