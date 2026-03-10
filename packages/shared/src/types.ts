// ============================================================
// Enums (mirror Prisma enums for frontend use)
// ============================================================

export type BatteryLevelType = 'GREEN' | 'YELLOW' | 'RED' | 'LURKER'

export type ToneTagType =
  | 'ENTHUSIASM'
  | 'RANT'
  | 'DEBATE'
  | 'INFO_DUMP'
  | 'QUESTION'
  | 'HELP'

export type NeurodivTypeValue =
  | 'ADHD_INATTENTIVE'
  | 'ADHD_HYPERACTIVE'
  | 'ADHD_COMBINED'
  | 'AUTISM'
  | 'DYSLEXIA'
  | 'DYSCALCULIA'
  | 'DYSPRAXIA'
  | 'TOURETTE'
  | 'OCD'
  | 'BIPOLAR'
  | 'ANXIETY'
  | 'DEPRESSION'
  | 'SENSORY_PROCESSING'
  | 'OTHER'
  | 'PREFER_NOT_TO_SAY'

export type AnimationToleranceType = 'NONE' | 'MINIMAL' | 'MODERATE' | 'FULL'
export type InfoDensityType = 'COMPACT' | 'COMFORTABLE' | 'SPACIOUS'
export type ContrastModeType = 'DEFAULT' | 'HIGH' | 'MUTED' | 'DARK_FOCUS'
export type OnboardingStepType = 'BASICS' | 'HYPERFOCI' | 'SENSORY' | 'BATTERY_TUTORIAL' | 'COMPLETED'

// ============================================================
// User & Profile Types
// ============================================================

export interface UserPublic {
  id: string
  username: string | null
  profile: ProfilePublic | null
  socialBattery: SocialBatteryPublic | null
}

export interface ProfilePublic {
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  pronouns: string | null
  ageRange: string | null
  timezone: string | null
  languages: string[]
  neurodivTypes: NeurodivTypeValue[]
  selfDiagnosed: boolean
  comfortTopics: string[]
  communicationStyle: string | null
  currentMood: string | null
  currentHyperfoci: string[]
  onboardingStep: OnboardingStepType
  onboardingCompleted: boolean
}

export interface SocialBatteryPublic {
  level: BatteryLevelType
  manualOverride: boolean
  autoDecayEnabled: boolean
  decayRateMinutes: number
  lastLevelChange: string
}

// ============================================================
// Sensory Preferences
// ============================================================

export interface SensoryPreferencesConfig {
  colorPalette: ContrastModeType
  animationTolerance: AnimationToleranceType
  informationDensity: InfoDensityType
  transitionSpeed: string
  fontScale: number
  reducedMotion: boolean
  bionicReadingEnabled: boolean
  dyslexicFontEnabled: boolean
  lineSpacing: string
  notificationIntensity: string
  soundEnabled: boolean
  hapticEnabled: boolean
  activePreset: string | null
}

export interface SensoryPreset {
  key: string
  label: string
  description: string
  config: Partial<SensoryPreferencesConfig>
}

// ============================================================
// Battery History
// ============================================================

export interface BatteryHistoryEntry {
  id: string
  fromLevel: BatteryLevelType
  toLevel: BatteryLevelType
  reason: string
  createdAt: string
}

// ============================================================
// Onboarding Types
// ============================================================

export interface OnboardingBasicsData {
  username: string
  pronouns: string
  neurodivTypes: NeurodivTypeValue[]
  selfDiagnosed: boolean
  ageRange?: string
}

export interface OnboardingHyperfociData {
  currentHyperfoci: string[] // max 3
  hyperfocusHistory: string[]
}

export interface OnboardingSensoryData {
  preset: string | null
  customConfig: Partial<SensoryPreferencesConfig>
}

export interface OnboardingBatteryData {
  autoDecayEnabled: boolean
  decayRateMinutes: number
  autoLurkerStart: string | null
  autoLurkerEnd: string | null
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiHealthResponse {
  status: 'ok' | 'error'
  timestamp: string
}

export interface BatteryUpdateRequest {
  level: BatteryLevelType
  manualOverride?: boolean
}

export interface ProfileUpdateRequest {
  displayName?: string
  bio?: string
  pronouns?: string
  ageRange?: string
  timezone?: string
  languages?: string[]
  neurodivTypes?: NeurodivTypeValue[]
  selfDiagnosed?: boolean
  comfortTopics?: string[]
  triggerWarnings?: string[]
  communicationStyle?: string
  currentMood?: string
  currentHyperfoci?: string[]
  onboardingStep?: OnboardingStepType
  onboardingCompleted?: boolean
}

export interface SensoryPreferencesUpdateRequest {
  colorPalette?: ContrastModeType
  animationTolerance?: AnimationToleranceType
  informationDensity?: InfoDensityType
  transitionSpeed?: string
  fontScale?: number
  reducedMotion?: boolean
  bionicReadingEnabled?: boolean
  dyslexicFontEnabled?: boolean
  lineSpacing?: string
  notificationIntensity?: string
  soundEnabled?: boolean
  hapticEnabled?: boolean
  activePreset?: string | null
}

export interface BatteryConfigUpdateRequest {
  autoDecayEnabled?: boolean
  decayRateMinutes?: number
  rechargeReminders?: boolean
  autoLurkerStart?: string | null
  autoLurkerEnd?: string | null
  manualOverride?: boolean
}
