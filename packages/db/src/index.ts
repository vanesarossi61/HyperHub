export { PrismaClient } from '@prisma/client'

// Phase 1-2 Models
export type {
  User,
  Profile,
  SensoryPreferences,
  SocialBattery,
  BatteryHistory,
} from '@prisma/client'

// Phase 3 Models
export type {
  Post,
  Comment,
  Reaction,
  Bookmark,
} from '@prisma/client'

// Phase 4 Models
export type {
  Conversation,
  ConversationParticipant,
  Message,
  MessageRead,
  SafeExit,
  NotificationPreference,
} from '@prisma/client'

// Enums
export {
  BatteryLevel,
  ToneTag,
  NeurodivType,
  AnimationTolerance,
  InfoDensity,
  ContrastMode,
  OnboardingStep,
  ReactionType,
  Visibility,
  ConversationType,
  MessageStatus,
  ParticipantRole,
  SafeExitReason,
  NotificationPriority,
} from '@prisma/client'
