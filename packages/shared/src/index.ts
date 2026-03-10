// ============================================================
// HyperHub Shared Package - Public API
// ============================================================

// Types
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

  // Sensory
  SensoryPreferencesConfig,
  SensoryPreset,

  // Battery
  BatteryHistoryEntry,

  // Onboarding
  OnboardingBasicsData,
  OnboardingHyperfociData,
  OnboardingSensoryData,
  OnboardingBatteryData,

  // Posts (Phase 3)
  PostPublic,
  PostDetail,
  ReactionCount,
  CommentPublic,
  BookmarkPublic,

  // Post Requests (Phase 3)
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  ToggleReactionRequest,
  ToggleBookmarkRequest,

  // Feed (Phase 3)
  FeedFilters,
  FeedSortOption,
  FeedQuery,
  FeedResponse,
  TldrResponse,

  // API
  ApiResponse,
  ApiHealthResponse,
  BatteryUpdateRequest,
  ProfileUpdateRequest,
  SensoryPreferencesUpdateRequest,
  BatteryConfigUpdateRequest,
} from './types'

// Constants
export {
  BATTERY_LEVELS,
  TONE_TAGS,
  NEURODIV_TYPES,
  SENSORY_DEFAULTS,
  SENSORY_PRESETS,
  COLOR_PALETTES,
  ANIMATION_LEVELS,
  DENSITY_LEVELS,
  ONBOARDING_STEPS,
  AGE_RANGES,
  PRONOUNS_OPTIONS,
  APP_CONFIG,
  BATTERY_MIDDLEWARE_CONFIG,
  // Phase 3
  REACTION_TYPES,
  FEED_SORT_OPTIONS,
  POST_LIMITS,
  FEED_CONFIG,
  READING_CONFIG,
  ANTI_RABBIT_HOLE_CONFIG,
} from './constants'
