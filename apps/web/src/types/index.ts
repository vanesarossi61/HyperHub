/**
 * App-specific types that extend or complement @hyperhub/shared types.
 * Import shared types from '@hyperhub/shared' for cross-package types.
 */

export type { 
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
} from '@hyperhub/shared'

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
