import type {
  NeurodivTypeValue,
  AnimationToleranceType,
  InfoDensityType,
  ContrastModeType,
  OnboardingStepType,
  SensoryPreset,
  ReactionTypeValue,
  VisibilityType,
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
    emoji: '\u{2753}',
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
  maxHyperfoci: 3,
  maxBioLength: 500,
  maxDisplayNameLength: 50,
  maxHyperfocusHistory: 20,
  defaultBatteryLevel: 'GREEN' as const,
  batteryDecayDefaultMinutes: 120,
  batteryDelayYellowMs: 5 * 60 * 1000,
  version: '0.3.0',
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

// ============================================================
// Reactions (New - Phase 3)
// ============================================================

export const REACTIONS: Record<ReactionTypeValue, { label: string; emoji: string; description: string; color: string }> = {
  ME_TOO: {
    label: 'Yo Tambien',
    emoji: '\u{1F64B}',
    description: 'Me identifico con esto',
    color: '#F59E0B',
  },
  BRAIN_EXPLODE: {
    label: 'Cerebro Explotado',
    emoji: '\u{1F92F}',
    description: 'Esto me volo la cabeza',
    color: '#EF4444',
  },
  HYPERFOCUS_ACTIVATED: {
    label: 'Hiperfoco Activado',
    emoji: '\u{1F3AF}',
    description: 'Ahora necesito saber todo sobre esto',
    color: '#8B5CF6',
  },
  GENTLE_HUG: {
    label: 'Abrazo Gentil',
    emoji: '\u{1FAC2}',
    description: 'Te mando un abrazo virtual',
    color: '#EC4899',
  },
  INFO_GOLD: {
    label: 'Oro Informativo',
    emoji: '\u{1F4A1}',
    description: 'Informacion super valiosa',
    color: '#10B981',
  },
}

// ============================================================
// Visibility Options (New - Phase 3)
// ============================================================

export const VISIBILITY_OPTIONS: Record<VisibilityType, { label: string; description: string; emoji: string }> = {
  PUBLIC: {
    label: 'Publico',
    description: 'Visible para toda la comunidad',
    emoji: '\u{1F30D}',
  },
  FOLLOWERS: {
    label: 'Seguidores',
    description: 'Solo tus seguidores pueden ver',
    emoji: '\u{1F465}',
  },
  HYPERFOCUS_GROUP: {
    label: 'Grupo de Hiperfoco',
    description: 'Solo personas con hiperfocos similares',
    emoji: '\u{1F3AF}',
  },
  PRIVATE: {
    label: 'Privado',
    description: 'Solo tu puedes ver',
    emoji: '\u{1F512}',
  },
}

// ============================================================
// Feed Config (New - Phase 3)
// ============================================================

export const FEED_CONFIG = {
  postsPerPage: 15,
  maxPostLength: 5000,
  maxMediaUrls: 4,
  maxTagsPerPost: 5,
  
  // Dopamine curation weights
  curation: {
    hyperfocusMatchWeight: 3.0,
    freshnessWeight: 2.0,
    tonePreferenceWeight: 1.5,
    sameTopicPenalty: -1.5,
    sameAuthorPenalty: -2.0,
    serendipityFactor: 0.10,
  },
  
  // Freshness decay
  freshnessHalfLifeHours: 24,
  freshnessMaxDays: 7,
} as const

// ============================================================
// Reading Config (New - Phase 3)
// ============================================================

export const READING_CONFIG = {
  averageWPM: 200,
  bionicBoldRatio: 0.4,
  longPostThreshold: 300,
  tldrMaxLength: 280,
  tldrCacheDurationHours: 168,
} as const

// ============================================================
// Anti-Rabbit Hole Config (New - Phase 3)
// ============================================================

export const ANTI_RABBIT_HOLE = {
  enabled: true,
  sectionTimerMinutes: 30,
  gentleNudgeAfterPosts: 20,
  breakSuggestionMinutes: 45,
  neverGuilty: true,
  
  nudgeMessages: [
    'Oye, llevas un rato aca. Todo bien? Quizas es buen momento para estirarte.',
    'Tu cerebro hizo un gran trabajo hoy. Que tal un descanso?',
    'Recordatorio amistoso: el mundo exterior tambien existe. Pero no hay prisa.',
    'Llevas {minutes} minutos. Nada de malo, solo queria que supieras.',
    'Pausa sugerida! Tu bateria social te lo agradecera.',
  ],
  
  breakActivities: [
    { emoji: '\u{1F4A7}', label: 'Tomar agua', durationMinutes: 2 },
    { emoji: '\u{1F6B6}', label: 'Caminar un poco', durationMinutes: 5 },
    { emoji: '\u{1F9D8}', label: 'Respirar profundo', durationMinutes: 3 },
    { emoji: '\u{1F3B5}', label: 'Escuchar una cancion', durationMinutes: 4 },
    { emoji: '\u{1F431}', label: 'Acariciar a tu mascota', durationMinutes: 5 },
  ],
} as const
