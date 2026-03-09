import { PrismaClient, BatteryLevel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a demo user
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
          bio: 'Explorando HyperHub!',
          comfortTopics: ['TDAH', 'productividad', 'hiperfoco'],
          triggerWarnings: [],
          communicationStyle: 'direct',
          currentHyperfoci: ['HyperHub', 'TypeScript'],
          hyperfocusHistory: ['Minecraft', 'origami', 'plantas'],
          onboardingCompleted: true,
        },
      },
      sensoryPreferences: {
        create: {
          colorPalette: 'calm-default',
          animationLevel: 'minimal',
          informationDensity: 'comfortable',
          fontSize: 'medium',
          bionicReadingEnabled: false,
          notificationIntensity: 'gentle',
        },
      },
      socialBattery: {
        create: {
          level: BatteryLevel.GREEN,
          autoDecayEnabled: true,
          decayRateMinutes: 120,
          rechargeReminders: true,
        },
      },
    },
  })

  console.log(`Created demo user: ${demoUser.email}`)
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
