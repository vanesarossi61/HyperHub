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

// Phase 3 enums
export type ReactionTypeValue =
  | 'SAME_HERE'
  | 'BRAIN_EXPLODE'
  | 'HYPERFOCUS'
  | 'SPOON_GIFT'
  | 'INFODUMP_THANKS'
  | 'HUG'
  | 'SENSORY_OVERLOAD'

export type VisibilityType = 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE'

// Phase 4 enums
export type ConversationTypeValue = 'DIRECT' | 'GROUP' | 'SAFE_SPACE'
export type MessageStatusType = 'QUEUED' | 'DELIVERED' | 'READ' | 'FAILED'
export type ParticipantRoleType = 'OWNER' | 'ADMIN' | 'MEMBER'
export type SafeExitReasonType = 'NEED_BREAK' | 'SENSORY_OVERLOAD' | 'LOW_BATTERY' | 'OVERWHELMED' | 'CUSTOM'
export type NotificationPriorityType = 'SILENT' | 'LOW' | 'NORMAL' | 'URGENT'

// ============================================================
// User & Profile Types (Phase 1-2)
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
// Sensory Preferences (Phase 2)
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
// Battery History (Phase 2)
// ============================================================

export interface BatteryHistoryEntry {
  id: string
  fromLevel: BatteryLevelType
  toLevel: BatteryLevelType
  reason: string
  createdAt: string
}

// ============================================================
// Onboarding Types (Phase 2)
// ============================================================

export interface OnboardingBasicsData {
  username: string
  pronouns: string
  neurodivTypes: NeurodivTypeValue[]
  selfDiagnosed: boolean
  ageRange?: string
}

export interface OnboardingHyperfociData {
  currentHyperfoci: string[]
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
// Post Types (Phase 3)
// ============================================================

export interface PostPublic {
  id: string
  author: UserPublic
  title: string | null
  content: string
  toneTag: ToneTagType
  hyperfoci: string[]
  wordCount: number
  isInfoDump: boolean
  tldrSummary: string | null
  visibility: VisibilityType
  published: boolean
  pinned: boolean
  reactions: ReactionCount[]
  userReactions: ReactionTypeValue[]
  commentCount: number
  isBookmarked: boolean
  createdAt: string
  updatedAt: string
}

export interface PostDetail extends PostPublic {
  comments: CommentPublic[]
}

export interface ReactionCount {
  type: ReactionTypeValue
  count: number
}

export interface CommentPublic {
  id: string
  author: UserPublic
  content: string
  toneTag: ToneTagType | null
  parentId: string | null
  replies: CommentPublic[]
  createdAt: string
  updatedAt: string
}

export interface BookmarkPublic {
  id: string
  post: PostPublic
  folder: string | null
  createdAt: string
}

// ============================================================
// Post Request Types (Phase 3)
// ============================================================

export interface CreatePostRequest {
  title?: string
  content: string
  toneTag: ToneTagType
  hyperfoci?: string[]
  visibility?: VisibilityType
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  toneTag?: ToneTagType
  hyperfoci?: string[]
  visibility?: VisibilityType
  pinned?: boolean
}

export interface CreateCommentRequest {
  content: string
  toneTag?: ToneTagType
  parentId?: string
}

export interface ToggleReactionRequest {
  type: ReactionTypeValue
}

export interface ToggleBookmarkRequest {
  folder?: string
}

// ============================================================
// Feed Types (Phase 3)
// ============================================================

export interface FeedFilters {
  toneTag?: ToneTagType
  hyperfocus?: string
  authorId?: string
  visibility?: VisibilityType
  isInfoDump?: boolean
  search?: string
}

export type FeedSortOption = 'recent' | 'trending' | 'hyperfocus_match' | 'spoon_friendly'

export interface FeedQuery {
  filters?: FeedFilters
  sort?: FeedSortOption
  cursor?: string
  limit?: number
}

export interface FeedResponse {
  posts: PostPublic[]
  nextCursor: string | null
  hasMore: boolean
  totalEstimate?: number
}

export interface TldrResponse {
  postId: string
  summary: string
  keyPoints: string[]
  readingTimeSeconds: number
  generatedAt: string
}

// ============================================================
// Phase 4: Conversation Types
// ============================================================

export interface ConversationPublic {
  id: string
  type: ConversationTypeValue
  name: string | null
  description: string | null
  avatarUrl: string | null
  maxMembers: number
  toneTagRequired: boolean
  slowModeSeconds: number
  isActive: boolean
  lastMessageAt: string | null
  participants: ParticipantPublic[]
  lastMessage: MessagePublic | null
  unreadCount: number
  createdAt: string
}

export interface ConversationDetail extends ConversationPublic {
  messages: MessagePublic[]
  hasMoreMessages: boolean
  nextCursor: string | null
}

export interface ParticipantPublic {
  id: string
  user: UserPublic
  role: ParticipantRoleType
  nickname: string | null
  muted: boolean
  pinned: boolean
  lastReadAt: string | null
  joinedAt: string
  isOnline: boolean // Derived from socket connection
  isTyping: boolean // Derived from socket events
}

// ============================================================
// Phase 4: Message Types
// ============================================================

export interface MessagePublic {
  id: string
  conversationId: string
  sender: UserPublic
  content: string
  toneTag: ToneTagType
  status: MessageStatusType
  replyTo: MessageReplyPreview | null
  editedAt: string | null
  isSystem: boolean
  reads: MessageReadInfo[]
  createdAt: string
}

export interface MessageReplyPreview {
  id: string
  sender: { id: string; username: string | null; displayName: string | null }
  content: string // Truncated to ~100 chars
  toneTag: ToneTagType
}

export interface MessageReadInfo {
  userId: string
  username: string | null
  readAt: string
}

// ============================================================
// Phase 4: Safe Exit Types
// ============================================================

export interface SafeExitPublic {
  id: string
  userId: string
  user: UserPublic
  conversationId: string | null
  reason: SafeExitReasonType
  customMessage: string | null
  autoMessage: string
  exitedAt: string
  returnedAt: string | null
  plannedReturn: string | null
}

export interface SafeExitStatus {
  isOnBreak: boolean
  currentExit: SafeExitPublic | null
  breakDurationMinutes: number | null
  plannedReturn: string | null
}

// ============================================================
// Phase 4: Notification Preference Types
// ============================================================

export interface NotificationPreferencePublic {
  greenBattery: NotificationPriorityType
  yellowBattery: NotificationPriorityType
  redBattery: NotificationPriorityType
  lurkerBattery: NotificationPriorityType
  quietHoursEnabled: boolean
  quietHoursStart: string | null
  quietHoursEnd: string | null
  digestEnabled: boolean
  digestIntervalMin: number
  newMessageEnabled: boolean
  mentionEnabled: boolean
  reactionEnabled: boolean
  safeExitEnabled: boolean
}

// ============================================================
// Phase 4: Request Types
// ============================================================

export interface CreateConversationRequest {
  type: ConversationTypeValue
  participantIds: string[] // User IDs to add
  name?: string // Required for GROUP/SAFE_SPACE
  description?: string
  toneTagRequired?: boolean
  slowModeSeconds?: number
}

export interface SendMessageRequest {
  content: string
  toneTag: ToneTagType
  replyToId?: string
}

export interface EditMessageRequest {
  content: string
  toneTag?: ToneTagType
}

export interface UpdateConversationRequest {
  name?: string
  description?: string
  toneTagRequired?: boolean
  slowModeSeconds?: number
  contentWarnings?: boolean
}

export interface AddParticipantRequest {
  userId: string
  role?: ParticipantRoleType
}

export interface UpdateParticipantRequest {
  role?: ParticipantRoleType
  nickname?: string
  muted?: boolean
  pinned?: boolean
}

export interface SafeExitRequest {
  reason: SafeExitReasonType
  customMessage?: string
  conversationId?: string // null = exit all
  plannedReturn?: string // ISO date
}

export interface ReturnFromBreakRequest {
  safeExitId: string
}

export interface UpdateNotificationPrefsRequest {
  greenBattery?: NotificationPriorityType
  yellowBattery?: NotificationPriorityType
  redBattery?: NotificationPriorityType
  lurkerBattery?: NotificationPriorityType
  quietHoursEnabled?: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  digestEnabled?: boolean
  digestIntervalMin?: number
  newMessageEnabled?: boolean
  mentionEnabled?: boolean
  reactionEnabled?: boolean
  safeExitEnabled?: boolean
}

// ============================================================
// Phase 4: Socket Event Types
// ============================================================

export interface SocketMessageEvent {
  type: 'new_message'
  conversationId: string
  message: MessagePublic
}

export interface SocketTypingEvent {
  type: 'typing_start' | 'typing_stop'
  conversationId: string
  userId: string
  username: string | null
}

export interface SocketPresenceEvent {
  type: 'user_online' | 'user_offline'
  userId: string
}

export interface SocketReadEvent {
  type: 'messages_read'
  conversationId: string
  userId: string
  readUpTo: string // Message ID
}

export interface SocketSafeExitEvent {
  type: 'safe_exit' | 'return_from_break'
  conversationId: string | null
  userId: string
  autoMessage: string
}

export interface SocketMessageEditEvent {
  type: 'message_edited'
  conversationId: string
  messageId: string
  newContent: string
  newToneTag: ToneTagType
  editedAt: string
}

export type SocketEvent =
  | SocketMessageEvent
  | SocketTypingEvent
  | SocketPresenceEvent
  | SocketReadEvent
  | SocketSafeExitEvent
  | SocketMessageEditEvent

// ============================================================
// Phase 4: Message Queue Types (Battery-based delivery)
// ============================================================

export interface QueuedMessageInfo {
  messageId: string
  conversationId: string
  senderUsername: string | null
  toneTag: ToneTagType
  preview: string // First 50 chars
  queuedAt: string
  recipientBattery: BatteryLevelType
  estimatedDelivery: string | null // When battery allows
}

export interface MessageQueueStatus {
  pendingCount: number
  messages: QueuedMessageInfo[]
  nextDeliveryCheck: string
}

// ============================================================
// API Response Types (shared across all phases)
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
