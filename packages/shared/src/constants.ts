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
  },
  YELLOW: {
    key: 'YELLOW' as const,
    label: 'Energia Media',
    description: 'Disponible pero prefiero interacciones breves y tranquilas',
    color: '#eab308',
    bgColor: '#fef9c3',
    emoji: '\u{1F7E1}',
  },
  RED: {
    key: 'RED' as const,
    label: 'Energia Baja',
    description: 'Necesito espacio. Solo quiero observar sin presion',
    color: '#ef4444',
    bgColor: '#fee2e2',
    emoji: '\u{1F534}',
  },
  LURKER: {
    key: 'LURKER' as const,
    label: 'Modo Fantasma',
    description: 'Invisible. Recargando bateria social en silencio',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    emoji: '\u{1F47B}',
  },
} as const

export type BatteryLevelKey = keyof typeof BATTERY_LEVELS

// ============================================================
// Tone Tags
// ============================================================

export const TONE_TAGS = {
  ENTHUSIASM: {
    key: 'ENTHUSIASM' as const,
    label: 'Entusiasmo',
    emoji: '\u{2728}',
    description: 'Estoy emocionado/a compartiendo esto',
  },
  RANT: {
    key: 'RANT' as const,
    label: 'Desahogo',
    emoji: '\u{1F32A}',
    description: 'Necesito expresarme, no busco soluciones',
  },
  DEBATE: {
    key: 'DEBATE' as const,
    label: 'Debate',
    emoji: '\u{1F4AC}',
    description: 'Abierto/a a diferentes perspectivas',
  },
  INFO_DUMP: {
    key: 'INFO_DUMP' as const,
    label: 'Info Dump',
    emoji: '\u{1F4DA}',
    description: 'Compartiendo conocimiento profundo sobre un tema',
  },
  QUESTION: {
    key: 'QUESTION' as const,
    label: 'Pregunta',
    emoji: '\u{2753}',
    description: 'Busco informacion o ayuda',
  },
  HELP: {
    key: 'HELP' as const,
    label: 'Ayuda',
    emoji: '\u{1F91D}',
    description: 'Necesito apoyo o acompanamiento',
  },
} as const

export type ToneTagKey = keyof typeof TONE_TAGS

// ============================================================
// Sensory Defaults
// ============================================================

export const SENSORY_DEFAULTS = {
  colorPalette: 'calm-default',
  animationLevel: 'minimal',
  informationDensity: 'comfortable',
  transitionSpeed: 'normal',
  fontSize: 'medium',
  bionicReadingEnabled: false,
  dyslexicFontEnabled: false,
  lineSpacing: 'normal',
  notificationIntensity: 'gentle',
  soundEnabled: false,
  hapticEnabled: true,
} as const

export const COLOR_PALETTES = [
  { key: 'calm-default', label: 'Calma (Defecto)', description: 'Colores suaves y relajantes' },
  { key: 'high-contrast', label: 'Alto Contraste', description: 'Maximo contraste para legibilidad' },
  { key: 'muted', label: 'Apagado', description: 'Tonos desaturados y suaves' },
  { key: 'dark-focus', label: 'Oscuro Enfocado', description: 'Modo oscuro con acentos minimos' },
] as const

export const ANIMATION_LEVELS = [
  { key: 'none', label: 'Sin Animaciones', description: 'Completamente estatico' },
  { key: 'minimal', label: 'Minimo', description: 'Solo transiciones esenciales' },
  { key: 'moderate', label: 'Moderado', description: 'Animaciones sutiles' },
  { key: 'full', label: 'Completo', description: 'Todas las animaciones activas' },
] as const

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
  defaultBatteryLevel: 'GREEN' as const,
  batteryDecayDefaultMinutes: 120,
  version: '0.1.0',
} as const
