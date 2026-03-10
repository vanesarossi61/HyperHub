// Re-export all shared types for app-level use
// This file bridges @hyperhub/shared types into the app's type system

export type {
  // Enums
  BatteryLevelType,
  ToneTagType,
  NeurodivTypeValue,
  AnimationToleranceType,
  InfoDensityType,
  ContrastModeType,
  OnboardingStepType,
  ReactionTypeValue,
  VisibilityType,

  // User & Profile
  UserPublic,
  ProfilePublic,
  SocialBatteryPublic,
  SensoryPreferencesConfig,
  SensoryPreset,
  BatteryHistoryEntry,

  // Onboarding
  OnboardingBasicsData,
  OnboardingHyperfociData,
  OnboardingSensoryData,
  OnboardingBatteryData,

  // Posts & Feed (Phase 3)
  PostPublic,
  PostAuthor,
  TagPublic,
  ReactionPublic,
  BookmarkFolderPublic,
  FeedFilters,
  FeedPage,
  DopamineCurationFactors,
  AntiRabbitHoleConfig,
  ReadingConfig,
  CreatePostRequest,
  UpdatePostRequest,
  ToggleReactionRequest,
  ToggleBookmarkRequest,

  // API
  ApiResponse,
  ApiHealthResponse,
  BatteryUpdateRequest,
  ProfileUpdateRequest,
  SensoryPreferencesUpdateRequest,
  BatteryConfigUpdateRequest,
} from '@hyperhub/shared'
