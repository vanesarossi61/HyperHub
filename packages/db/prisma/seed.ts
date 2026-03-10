import { PrismaClient, BatteryLevel, NeurodivType, AnimationTolerance, InfoDensity, ContrastMode, OnboardingStep } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo user with full Phase 2 profile
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@hyperhub.dev' },
    update: {},
    create: {
      clerkId: 'demo_clerk_id',
      email: 'demo@hyperhub.dev',
      username: 'demo_user',
      profile: {
        create: {
          displayName: 'Usuario Demo',
          bio: 'Explorando HyperHub! Mi cerebro funciona diferente y eso esta bien.',
          pronouns: 'elle/they',
          ageRange: '25-34',
          timezone: 'America/Buenos_Aires',
          languages: ['es', 'en'],
          neurodivTypes: [NeurodivType.ADHD_COMBINED, NeurodivType.ANXIETY],
          selfDiagnosed: false,
          comfortTopics: ['TDAH', 'productividad', 'hiperfoco', 'neurodiversidad'],
          triggerWarnings: [],
          communicationStyle: 'direct',
          currentMood: 'focused',
          currentHyperfoci: ['HyperHub', 'TypeScript', 'UX accesible'],
          hyperfocusHistory: ['Minecraft', 'origami', 'plantas', 'astronomia'],
          onboardingStep: OnboardingStep.COMPLETED,
          onboardingCompleted: true,
        },
      },
      sensoryPreferences: {
        create: {
          colorPalette: ContrastMode.DEFAULT,
          animationTolerance: AnimationTolerance.MINIMAL,
          informationDensity: InfoDensity.COMFORTABLE,
          transitionSpeed: 'normal',
          fontScale: 1.0,
          reducedMotion: true,
          bionicReadingEnabled: false,
          dyslexicFontEnabled: false,
          lineSpacing: 'normal',
          notificationIntensity: 'gentle',
          soundEnabled: false,
          hapticEnabled: true,
          activePreset: null,
        },
      },
      socialBattery: {
        create: {
          level: BatteryLevel.GREEN,
          manualOverride: false,
          autoDecayEnabled: true,
          decayRateMinutes: 120,
          rechargeReminders: true,
          autoLurkerStart: '23:00',
          autoLurkerEnd: '08:00',
        },
      },
    },
  })

  // Create a second user for testing interactions
  const testUser = await prisma.user.upsert({
    where: { email: 'test@hyperhub.dev' },
    update: {},
    create: {
      clerkId: 'test_clerk_id',
      email: 'test@hyperhub.dev',
      username: 'test_neurodiv',
      profile: {
        create: {
          displayName: 'Tester Neurodiv',
          bio: 'Testing all the things!',
          pronouns: 'ella/her',
          ageRange: '18-24',
          timezone: 'Europe/Madrid',
          languages: ['es'],
          neurodivTypes: [NeurodivType.ADHD_INATTENTIVE, NeurodivType.DYSLEXIA],
          selfDiagnosed: true,
          comfortTopics: ['arte digital', 'musica', 'gaming'],
          triggerWarnings: ['ruidos fuertes'],
          communicationStyle: 'gentle',
          currentMood: 'creative',
          currentHyperfoci: ['pixel art', 'lo-fi music'],
          hyperfocusHistory: ['crochet', 'baking', 'K-pop'],
          onboardingStep: OnboardingStep.COMPLETED,
          onboardingCompleted: true,
        },
      },
      sensoryPreferences: {
        create: {
          colorPalette: ContrastMode.MUTED,
          animationTolerance: AnimationTolerance.NONE,
          informationDensity: InfoDensity.SPACIOUS,
          transitionSpeed: 'slow',
          fontScale: 1.2,
          reducedMotion: true,
          bionicReadingEnabled: true,
          dyslexicFontEnabled: true,
          lineSpacing: 'relaxed',
          notificationIntensity: 'silent',
          soundEnabled: false,
          hapticEnabled: false,
          activePreset: 'calm',
        },
      },
      socialBattery: {
        create: {
          level: BatteryLevel.YELLOW,
          manualOverride: false,
          autoDecayEnabled: true,
          decayRateMinutes: 90,
          rechargeReminders: true,
        },
      },
    },
  })

  // Add some battery history for demo user
  await prisma.batteryHistory.createMany({
    data: [
      { userId: demoUser.id, fromLevel: BatteryLevel.GREEN, toLevel: BatteryLevel.YELLOW, reason: 'auto_decay' },
      { userId: demoUser.id, fromLevel: BatteryLevel.YELLOW, toLevel: BatteryLevel.GREEN, reason: 'manual' },
      { userId: demoUser.id, fromLevel: BatteryLevel.GREEN, toLevel: BatteryLevel.RED, reason: 'manual' },
      { userId: demoUser.id, fromLevel: BatteryLevel.RED, toLevel: BatteryLevel.LURKER, reason: 'schedule' },
      { userId: demoUser.id, fromLevel: BatteryLevel.LURKER, toLevel: BatteryLevel.GREEN, reason: 'schedule' },
    ],
  })

  console.log(`Created demo user: ${demoUser.email}`)
  console.log(`Created test user: ${testUser.email}`)
  console.log('Battery history seeded')
  console.log('Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
