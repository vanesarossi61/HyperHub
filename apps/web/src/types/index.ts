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

  // Phase 4 Enums
  ConversationTypeValue,
  MessageStatusType,
  ParticipantRoleType,
  SafeExitReasonType,
  NotificationPriorityType,

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

  // Conversations (Phase 4)
  ConversationPublic,
  ConversationDetail,
  ParticipantPublic,

  // Messages (Phase 4)
  MessagePublic,
  MessageReplyPreview,
  MessageReadInfo,

  // Safe Exit (Phase 4)
  SafeExitPublic,
  SafeExitStatus,

  // Notifications (Phase 4)
  NotificationPreferencePublic,

  // Requests (Phase 4)
  CreateConversationRequest,
  SendMessageRequest,
  EditMessageRequest,
  UpdateConversationRequest,
  AddParticipantRequest,
  UpdateParticipantRequest,
  SafeExitRequest,
  ReturnFromBreakRequest,
  UpdateNotificationPrefsRequest,

  // Socket Events (Phase 4)
  SocketMessageEvent,
  SocketTypingEvent,
  SocketPresenceEvent,
  SocketReadEvent,
  SocketSafeExitEvent,
  SocketMessageEditEvent,
  SocketEvent,

  // Message Queue (Phase 4)
  QueuedMessageInfo,
  MessageQueueStatus,

  // API
  ApiResponse,
  ApiHealthResponse,
  BatteryUpdateRequest,
  ProfileUpdateRequest,
  SensoryPreferencesUpdateRequest,
  BatteryConfigUpdateRequest,
} from '@hyperhub/shared'
