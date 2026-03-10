// ============================================================
// HyperHub App Types -- Re-exports from shared package
// Plus any app-specific types not in the shared package
// ============================================================

// Re-export everything from shared
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
} from '@hyperhub/shared'
