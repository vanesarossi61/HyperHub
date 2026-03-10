/**
 * App-specific types that extend or complement @hyperhub/shared types.
 * Import shared types from '@hyperhub/shared' for cross-package types.
 */

export type {
  // Core types
  UserPublic,
  ProfilePublic,
  SocialBatteryPublic,
  BatteryLevelType,
  ToneTagType,
  SensoryPreferencesConfig,
  ApiResponse,
  ApiHealthResponse,
  BatteryUpdateRequest,
  ProfileUpdateRequest,
  // Phase 2 types
  NeurodivTypeValue,
  AnimationToleranceType,
  InfoDensityType,
  ContrastModeType,
  OnboardingStepType,
  SensoryPreset,
  BatteryHistoryEntry,
  OnboardingBasicsData,
  OnboardingHyperfociData,
  OnboardingSensoryData,
  OnboardingBatteryData,
  SensoryPreferencesUpdateRequest,
  BatteryConfigUpdateRequest,
} from '@hyperhub/shared'

// Re-export constant types
export type { BatteryLevelKey, ToneTagKey, DeliveryMode } from '@hyperhub/shared'

// Navigation
export interface NavItem {
  label: string
  href: string
  icon: string
  description?: string
}

// Component props
export interface PageProps {
  params: Promise<Record<string, string>>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// Battery Middleware types
export type { DeliveryPayload, DeliveryResult } from '@/lib/batteryMiddleware'
