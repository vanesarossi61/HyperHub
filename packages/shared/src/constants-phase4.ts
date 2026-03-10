import type {
  NeurodivTypeValue,
  AnimationToleranceType,
  InfoDensityType,
  ContrastModeType,
  OnboardingStepType,
  ReactionTypeValue,
  SensoryPreset,
  FeedSortOption,
  ConversationTypeValue,
  SafeExitReasonType,
  NotificationPriorityType,
  MessageStatusType,
} from './types'

// ============================================================
// Battery Levels (Phase 1-2)
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
// Tone Tags (Phase 1-2)
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
// Reaction Types (Phase 3)
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
  { key: 'recent', label: 'Mas Recientes', description: 'Posts mas nuevos primero' },
  { key: 'trending', label: 'Tendencia', description: 'Lo que mas reacciones tiene ahora' },
  { key: 'hyperfocus_match', label: 'Mis Hiperfocos', description: 'Posts que coinciden con tus intereses actuales' },
  { key: 'spoon_friendly', label: 'Bajo Esfuerzo', description: 'Posts cortos y faciles de consumir' },
]

export const POST_LIMITS = {
  maxTitleLength: 150,
  maxContentLength: 10000,
  maxHyperfociPerPost: 5,
  infoDumpThreshold: 300,
  tldrMinWords: 50,
  previewLength: 280,
  maxCommentLength: 2000,
  maxCommentDepth: 3,
} as const

export const FEED_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 50,
  infiniteScrollThreshold: 0.8,
  staleTime: 30 * 1000,
  cacheTime: 5 * 60 * 1000,
  dopamineWeights: {
    recency: 0.3,
    hyperfocusMatch: 0.35,
    novelty: 0.2,
    communityEngagement: 0.15,
  },
} as const

export const READING_CONFIG = {
  wordsPerMinute: 200,
  bionicBoldRatio: 0.4,
  bionicMinWordLength: 3,
} as const

export const ANTI_RABBIT_HOLE_CONFIG = {
  checkIntervalMs: 15 * 60 * 1000,
  softNudgeMinutes: 30,
  mediumNudgeMinutes: 60,
  strongNudgeMinutes: 90,
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
// Phase 4: Conversation Configuration
// ============================================================

export const CONVERSATION_TYPES: Record<ConversationTypeValue, {
  key: ConversationTypeValue
  label: string
  description: string
  emoji: string
  maxMembers: number
  defaultToneTagRequired: boolean
}> = {
  DIRECT: {
    key: 'DIRECT',
    label: 'Mensaje Directo',
    description: 'Chat privado 1:1 con otra persona',
    emoji: '\u{1F4AC}',
    maxMembers: 2,
    defaultToneTagRequired: true,
  },
  GROUP: {
    key: 'GROUP',
    label: 'Grupo',
    description: 'Chat grupal con hasta 8 personas',
    emoji: '\u{1F465}',
    maxMembers: 8,
    defaultToneTagRequired: true,
  },
  SAFE_SPACE: {
    key: 'SAFE_SPACE',
    label: 'Espacio Seguro',
    description: 'Chat moderado con reglas de cuidado extra',
    emoji: '\u{1F49C}',
    maxMembers: 8,
    defaultToneTagRequired: true,
  },
}

// ============================================================
// Phase 4: Message Limits & Configuration
// ============================================================

export const MESSAGE_LIMITS = {
  maxContentLength: 4000,
  maxMessagesPerMinute: 10, // Rate limit
  maxConversationsPerUser: 50,
  maxGroupMembers: 8,
  maxDirectConversations: 30,
  messagePreviewLength: 100, // Characters for reply preview
  typingTimeoutMs: 5000, // Stop showing "typing" after 5s of inactivity
  editWindowMinutes: 15, // Can edit messages within 15 min
} as const

export const MESSAGE_STATUS_CONFIG: Record<MessageStatusType, {
  key: MessageStatusType
  label: string
  icon: string
  color: string
}> = {
  QUEUED: {
    key: 'QUEUED',
    label: 'En cola',
    icon: 'clock',
    color: '#6b7280',
  },
  DELIVERED: {
    key: 'DELIVERED',
    label: 'Enviado',
    icon: 'check',
    color: '#3B82F6',
  },
  READ: {
    key: 'READ',
    label: 'Leido',
    icon: 'check-check',
    color: '#22c55e',
  },
  FAILED: {
    key: 'FAILED',
    label: 'Error',
    icon: 'alert-circle',
    color: '#ef4444',
  },
}

// ============================================================
// Phase 4: Battery-Based Message Delivery
// ============================================================

export const BATTERY_DELIVERY_CONFIG = {
  GREEN: {
    mode: 'immediate' as const,
    description: 'Mensajes llegan al instante',
    queueDelay: 0,
    notificationLevel: 'NORMAL' as NotificationPriorityType,
  },
  YELLOW: {
    mode: 'delayed' as const,
    description: 'Mensajes llegan con un delay gentil de 5 min',
    queueDelay: 5 * 60 * 1000, // 5 minutes
    notificationLevel: 'LOW' as NotificationPriorityType,
  },
  RED: {
    mode: 'queued' as const,
    description: 'Mensajes se acumulan y llegan cuando suba tu bateria',
    queueDelay: -1, // Hold until battery changes
    notificationLevel: 'SILENT' as NotificationPriorityType,
  },
  LURKER: {
    mode: 'rejected' as const,
    description: 'Modo invisible. Los mensajes se guardan pero no notifican',
    queueDelay: -1, // Hold indefinitely
    notificationLevel: 'SILENT' as NotificationPriorityType,
  },
} as const

export const MESSAGE_QUEUE_CONFIG = {
  checkIntervalMs: 30 * 1000, // Check queue every 30s
  maxQueueSize: 100, // Max queued messages per user
  queueRetentionHours: 72, // Keep queued messages for 3 days
  batchDeliverySize: 10, // Deliver max 10 at a time when battery recovers
  digestSummaryThreshold: 5, // Summarize if > 5 queued messages
} as const

// ============================================================
// Phase 4: Safe Exit Configuration
// ============================================================

export const SAFE_EXIT_REASONS: Record<SafeExitReasonType, {
  key: SafeExitReasonType
  label: string
  emoji: string
  autoMessage: string
  description: string
  suggestedDurationMin: number
}> = {
  NEED_BREAK: {
    key: 'NEED_BREAK',
    label: 'Necesito una pausa',
    emoji: '\u{2615}',
    autoMessage: 'necesita tomar una pausa. Vuelve pronto.',
    description: 'Un descanso general para recargar',
    suggestedDurationMin: 15,
  },
  SENSORY_OVERLOAD: {
    key: 'SENSORY_OVERLOAD',
    label: 'Sobrecarga sensorial',
    emoji: '\u{26A1}',
    autoMessage: 'esta experimentando sobrecarga sensorial. Por favor, respeta su espacio.',
    description: 'Demasiado estimulo, necesito silencio',
    suggestedDurationMin: 30,
  },
  LOW_BATTERY: {
    key: 'LOW_BATTERY',
    label: 'Bateria baja',
    emoji: '\u{1FAAB}',
    autoMessage: 'tiene la bateria social baja. Los mensajes se guardan para despues.',
    description: 'Se activo automaticamente por bateria en rojo',
    suggestedDurationMin: 60,
  },
  OVERWHELMED: {
    key: 'OVERWHELMED',
    label: 'Me siento abrumado/a',
    emoji: '\u{1F97A}',
    autoMessage: 'se siente abrumado/a y necesita un momento. Estara bien.',
    description: 'Demasiadas cosas a la vez',
    suggestedDurationMin: 30,
  },
  CUSTOM: {
    key: 'CUSTOM',
    label: 'Otro motivo',
    emoji: '\u{1F4AD}',
    autoMessage: 'necesita un momento. Vuelve cuando este listo/a.',
    description: 'Escribe tu propio motivo',
    suggestedDurationMin: 15,
  },
}

export const SAFE_EXIT_CONFIG = {
  maxActiveExits: 1, // Only one active safe exit at a time
  autoReturnAfterHours: 24, // Auto-return after 24h if not manually returned
  showReturnNotification: true, // Notify conversation when user returns
  gracePeriodMinutes: 2, // Don't show exit to others for 2 min (in case of accidental tap)
  returnMessages: [
    'Volvi! Gracias por la paciencia.',
    'Ya estoy de vuelta. Como va todo?',
    'Regrese! Me siento mejor.',
    'Hola de nuevo! Necesitaba ese break.',
  ],
} as const

// ============================================================
// Phase 4: Typing Indicator Configuration
// ============================================================

export const TYPING_CONFIG = {
  debounceMs: 300, // Wait 300ms after last keystroke before sending event
  timeoutMs: 5000, // Stop showing after 5s of no typing events
  maxConcurrentTypers: 3, // Show max 3 "typing" at once, then "varios estan escribiendo"
  respectBattery: true, // Don't show typing if recipient battery is RED/LURKER
  messages: {
    single: (name: string) => `${name} esta escribiendo...`,
    two: (name1: string, name2: string) => `${name1} y ${name2} estan escribiendo...`,
    many: (count: number) => `${count} personas estan escribiendo...`,
  },
} as const

// ============================================================
// Phase 4: Socket Configuration
// ============================================================

export const SOCKET_CONFIG = {
  reconnectAttempts: 5,
  reconnectDelay: 1000, // Start with 1s, doubles each attempt
  reconnectDelayMax: 30000, // Max 30s between attempts
  pingInterval: 25000, // Ping every 25s
  pingTimeout: 10000, // Timeout after 10s
  transports: ['websocket', 'polling'] as const,
  // Presence
  presenceUpdateInterval: 60000, // Update presence every 60s
  offlineThreshold: 90000, // Consider offline after 90s of no ping
} as const

// ============================================================
// Phase 4: Notification Configuration
// ============================================================

export const NOTIFICATION_CONFIG = {
  // Battery-adaptive notification text
  batteryMessages: {
    GREEN: 'Nuevo mensaje',
    YELLOW: 'Mensaje guardado (lo veras cuando quieras)',
    RED: 'Mensaje en cola (se entregara cuando tu bateria suba)',
    LURKER: '', // No notification
  },
  // Digest configuration
  digestTemplate: (count: number) =>
    `Tenes ${count} mensaje${count !== 1 ? 's' : ''} sin leer. Cuando estes listo/a, estan ahi.`,
  // Priority overrides
  urgentKeywords: ['urgente', 'emergencia', 'importante', 'ayuda'],
  mentionPattern: /@(\w+)/g,
} as const

// ============================================================
// Phase 4: Sensory Presets (unchanged from Phase 2)
// ============================================================

export const SENSORY_PRESETS: SensoryPreset[] = [
  {
    key: 'calm',
    label: 'Calma Total',
    description: 'Minimo estimulo visual. Ideal para dias de sobrecarga.',
    config: {
      animationTolerance: 'NONE',
      informationDensity: 'SPACIOUS',
      reducedMotion: true,
      colorPalette: 'MUTED',
      notificationIntensity: 'silent',
      soundEnabled: false,
    },
  },
  {
    key: 'focus',
    label: 'Modo Foco',
    description: 'Optimizado para concentracion. Sin distracciones.',
    config: {
      animationTolerance: 'MINIMAL',
      informationDensity: 'COMPACT',
      reducedMotion: true,
      colorPalette: 'DARK_FOCUS',
      notificationIntensity: 'silent',
      bionicReadingEnabled: true,
    },
  },
  {
    key: 'high-energy',
    label: 'Alta Energia',
    description: 'Todos los estimulos! Para cuando tu cerebro quiere fiesta.',
    config: {
      animationTolerance: 'FULL',
      informationDensity: 'COMFORTABLE',
      reducedMotion: false,
      colorPalette: 'DEFAULT',
      notificationIntensity: 'full',
      soundEnabled: true,
    },
  },
  {
    key: 'minimal',
    label: 'Ultra Minimal',
    description: 'Lo mas simple posible. Solo texto, sin florituras.',
    config: {
      animationTolerance: 'NONE',
      informationDensity: 'COMPACT',
      reducedMotion: true,
      colorPalette: 'HIGH',
      notificationIntensity: 'gentle',
      soundEnabled: false,
      bionicReadingEnabled: false,
      dyslexicFontEnabled: false,
    },
  },
]

// ============================================================
// Neurodiv Types Display (unchanged from Phase 2)
// ============================================================

export const NEURODIV_DISPLAY: Record<NeurodivTypeValue, { label: string; emoji: string }> = {
  ADHD_INATTENTIVE: { label: 'TDAH Inatento', emoji: '\u{1F4AD}' },
  ADHD_HYPERACTIVE: { label: 'TDAH Hiperactivo', emoji: '\u{26A1}' },
  ADHD_COMBINED: { label: 'TDAH Combinado', emoji: '\u{1F300}' },
  AUTISM: { label: 'Autismo', emoji: '\u{1F9E9}' },
  DYSLEXIA: { label: 'Dislexia', emoji: '\u{1F524}' },
  DYSCALCULIA: { label: 'Discalculia', emoji: '\u{1F522}' },
  DYSPRAXIA: { label: 'Dispraxia', emoji: '\u{270B}' },
  TOURETTE: { label: 'Tourette', emoji: '\u{1F4A5}' },
  OCD: { label: 'TOC', emoji: '\u{1F504}' },
  BIPOLAR: { label: 'Bipolaridad', emoji: '\u{1F311}' },
  ANXIETY: { label: 'Ansiedad', emoji: '\u{1F4A8}' },
  DEPRESSION: { label: 'Depresion', emoji: '\u{1F327}' },
  SENSORY_PROCESSING: { label: 'Procesamiento Sensorial', emoji: '\u{1F50A}' },
  OTHER: { label: 'Otro', emoji: '\u{2B50}' },
  PREFER_NOT_TO_SAY: { label: 'Prefiero no decir', emoji: '\u{1F910}' },
}
