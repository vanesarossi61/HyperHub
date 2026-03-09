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
  comfortTopics: string[]
  communicationStyle: string | null
  currentHyperfoci: string[]
}

export interface SocialBatteryPublic {
  level: BatteryLevelType
  lastLevelChange: string
}

export type BatteryLevelType = 'GREEN' | 'YELLOW' | 'RED' | 'LURKER'

export type ToneTagType =
  | 'ENTHUSIASM'
  | 'RANT'
  | 'DEBATE'
  | 'INFO_DUMP'
  | 'QUESTION'
  | 'HELP'

// ============================================================
// Sensory Preferences
// ============================================================

export interface SensoryPreferencesConfig {
  colorPalette: string
  animationLevel: string
  informationDensity: string
  transitionSpeed: string
  fontSize: string
  bionicReadingEnabled: boolean
  dyslexicFontEnabled: boolean
  lineSpacing: string
  notificationIntensity: string
  soundEnabled: boolean
  hapticEnabled: boolean
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
}

export interface ProfileUpdateRequest {
  displayName?: string
  bio?: string
  pronouns?: string
  comfortTopics?: string[]
  triggerWarnings?: string[]
  communicationStyle?: string
  currentHyperfoci?: string[]
}
