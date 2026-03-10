// ============================================================
// HyperHub Unified Seed -- Phases 1-4
// packages/db/prisma/seed.ts
// ============================================================

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================
// Phase 1-3: Users, Profiles, Battery, Posts, Comments, Reactions
// ============================================================

async function seedPhase1to3() {
  console.log('Seeding HyperHub database (Phases 1-3)...')

  // ============================================================
  // Users
  // ============================================================

  const user1 = await prisma.user.upsert({
    where: { email: 'luna@hyperhub.dev' },
    update: {},
    create: {
      clerkId: 'clerk_demo_luna_001',
      email: 'luna@hyperhub.dev',
      username: 'luna_adhd',
      profile: {
        create: {
          displayName: 'Luna',
          bio: 'TDAH combinado. Mis hiperfocos cambian cada 2 semanas. Actualmente: acuaponia y mitologia nordica.',
          pronouns: 'ella/her',
          ageRange: '25-34',
          timezone: 'America/Buenos_Aires',
          languages: ['es', 'en'],
          neurodivTypes: ['ADHD_COMBINED', 'ANXIETY'],
          selfDiagnosed: false,
          comfortTopics: ['adhd', 'hiperfoco', 'productividad', 'gaming'],
          triggerWarnings: ['ruidos fuertes', 'luces intermitentes'],
          communicationStyle: 'Info-dumper entusiasta. Perdona si mando 15 mensajes seguidos.',
          currentMood: 'hiperfocuseada',
          currentHyperfoci: ['acuaponia', 'mitologia nordica', 'rust programming'],
          hyperfocusHistory: ['origami', 'astronomia', 'cocina japonesa', 'chess', 'crochet'],
          onboardingStep: 'COMPLETED',
          onboardingCompleted: true,
        },
      },
      sensoryPreferences: {
        create: {
          colorPalette: 'DARK_FOCUS',
          animationTolerance: 'MINIMAL',
          informationDensity: 'COMFORTABLE',
          transitionSpeed: 'fast',
          fontScale: 1.0,
          reducedMotion: true,
          bionicReadingEnabled: true,
          dyslexicFontEnabled: false,
          lineSpacing: 'normal',
          notificationIntensity: 'gentle',
          soundEnabled: false,
          hapticEnabled: true,
          activePreset: 'focus',
        },
      },
      socialBattery: {
        create: {
          level: 'GREEN',
          autoDecayEnabled: true,
          decayRateMinutes: 90,
          rechargeReminders: true,
          autoLurkerStart: '23:00',
          autoLurkerEnd: '09:00',
        },
      },
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'kai@hyperhub.dev' },
    update: {},
    create: {
      clerkId: 'clerk_demo_kai_002',
      email: 'kai@hyperhub.dev',
      username: 'kai_neurodiv',
      profile: {
        create: {
          displayName: 'Kai',
          bio: 'Autista + TDAH. Fan del info-dumping. Si me preguntas sobre trenes, prepara 3 horas.',
          pronouns: 'elle/they',
          ageRange: '18-24',
          timezone: 'Europe/Madrid',
          languages: ['es', 'en', 'ca'],
          neurodivTypes: ['AUTISM', 'ADHD_INATTENTIVE'],
          selfDiagnosed: true,
          comfortTopics: ['autism', 'trenes', 'historia', 'musica'],
          triggerWarnings: ['multitudes', 'cambios de planes subitos'],
          communicationStyle: 'Literal y directo. No es rudeza, es claridad.',
          currentMood: 'tranqui',
          currentHyperfoci: ['trenes europeos', 'historia bizantina'],
          hyperfocusHistory: ['dinosaurios', 'piano', 'minecraft redstone', 'mapas antiguos'],
          onboardingStep: 'COMPLETED',
          onboardingCompleted: true,
        },
      },
      sensoryPreferences: {
        create: {
          colorPalette: 'MUTED',
          animationTolerance: 'NONE',
          informationDensity: 'SPACIOUS',
          transitionSpeed: 'slow',
          fontScale: 1.2,
          reducedMotion: true,
          bionicReadingEnabled: false,
          dyslexicFontEnabled: false,
          lineSpacing: 'relaxed',
          notificationIntensity: 'silent',
          soundEnabled: false,
          hapticEnabled: false,
          activePreset: 'calm',
        },
      },
      socialBattery: {
        create: {
          level: 'YELLOW',
          autoDecayEnabled: true,
          decayRateMinutes: 60,
          rechargeReminders: true,
          autoLurkerStart: '21:00',
          autoLurkerEnd: '10:00',
        },
      },
    },
  })

  // User 3: Extra user for group conversations in Phase 4
  const user3 = await prisma.user.upsert({
    where: { email: 'sol@hyperhub.dev' },
    update: {},
    create: {
      clerkId: 'clerk_demo_sol_003',
      email: 'sol@hyperhub.dev',
      username: 'sol_creative',
      profile: {
        create: {
          displayName: 'Sol',
          bio: 'TDAH + dislexia. Artista digital y coleccionista de hiperfocos creativos.',
          pronouns: 'ella/she',
          ageRange: '25-34',
          timezone: 'America/Mexico_City',
          languages: ['es', 'en'],
          neurodivTypes: ['ADHD_COMBINED', 'DYSLEXIA'],
          selfDiagnosed: false,
          comfortTopics: ['arte digital', 'creatividad', 'dislexia', 'musica'],
          triggerWarnings: ['textos largos sin formato', 'presion de tiempo'],
          communicationStyle: 'Visual y metaforica. Prefiero mandar memes que explicar con palabras.',
          currentMood: 'inspirada',
          currentHyperfoci: ['pixel art', 'synth music'],
          hyperfocusHistory: ['acuarela', 'fotografia', 'cosplay', 'ukelele'],
          onboardingStep: 'COMPLETED',
          onboardingCompleted: true,
        },
      },
      sensoryPreferences: {
        create: {
          colorPalette: 'DEFAULT',
          animationTolerance: 'MODERATE',
          informationDensity: 'COMFORTABLE',
          transitionSpeed: 'normal',
          fontScale: 1.1,
          reducedMotion: false,
          bionicReadingEnabled: false,
          dyslexicFontEnabled: true,
          lineSpacing: 'relaxed',
          notificationIntensity: 'gentle',
          soundEnabled: true,
          hapticEnabled: true,
          activePreset: 'high-energy',
        },
      },
      socialBattery: {
        create: {
          level: 'GREEN',
          autoDecayEnabled: true,
          decayRateMinutes: 120,
          rechargeReminders: true,
        },
      },
    },
  })

  console.log(`Users created: ${user1.username}, ${user2.username}, ${user3.username}`)

  // ============================================================
  // Battery History
  // ============================================================

  await prisma.batteryHistory.createMany({
    data: [
      { userId: user1.id, fromLevel: 'GREEN', toLevel: 'YELLOW', reason: 'auto_decay' },
      { userId: user1.id, fromLevel: 'YELLOW', toLevel: 'GREEN', reason: 'manual' },
      { userId: user2.id, fromLevel: 'GREEN', toLevel: 'YELLOW', reason: 'auto_decay' },
      { userId: user2.id, fromLevel: 'YELLOW', toLevel: 'RED', reason: 'auto_decay' },
      { userId: user2.id, fromLevel: 'RED', toLevel: 'YELLOW', reason: 'manual' },
      { userId: user3.id, fromLevel: 'GREEN', toLevel: 'YELLOW', reason: 'auto_decay' },
    ],
  })
  console.log('Battery history seeded')

  // ============================================================
  // Posts (Phase 3)
  // ============================================================

  const post1 = await prisma.post.create({
    data: {
      authorId: user1.id,
      title: 'Acuaponia: cuando tu TDAH te convierte en granjera urbana',
      content: `Gente, llevo 3 semanas sin dormir bien porque descubri la acuaponia y NO PUEDO PARAR.

Para los que no saben: es un sistema donde las plantas y los peces se alimentan mutuamente. Los peces producen desechos que las bacterias convierten en nutrientes para las plantas, y las plantas limpian el agua para los peces. Es un CICLO PERFECTO.

Ya tengo:
- Un tanque de 200 litros con tilapias
- 3 camas de cultivo con lechuga, albahaca y tomates cherry
- Un sistema de bombeo que programe con un Arduino (porque claro, tambien tuve que aprender Arduino)
- Sensores de pH, temperatura y amonico conectados a mi celular

El problema? Mi departamento de 40m2 parece un laboratorio de Breaking Bad pero con plantas. Mi gata esta CONFUNDIDA.

Alguien mas tiene un hiperfoco que literalmente cambio la distribucion de su casa? Necesito saber que no soy la unica.`,
      toneTag: 'ENTHUSIASM',
      hyperfoci: ['acuaponia', 'arduino', 'plantas'],
      wordCount: 156,
      isInfoDump: false,
      published: true,
      pinned: true,
    },
  })

  const post2 = await prisma.post.create({
    data: {
      authorId: user2.id,
      title: null,
      content: `Dato del dia: El sistema ferroviario de Suiza tiene una puntualidad del 92.3%. Pero lo que nadie te cuenta es que su red de 5,196 km de vias fue construida en un pais donde el 60% del territorio es montanoso.

Los suizos desarrollaron el sistema de cremallera (rack railway) para subir pendientes de hasta 48%. El Pilatus Railway, construido en 1889, tiene la pendiente mas pronunciada del mundo con un 48% de inclinacion.

Pero lo mas fascinante es el Gotthard Base Tunnel: 57.09 km de tunel bajo los Alpes, el tunel ferroviario mas largo del mundo. Tomo 17 anos construirlo (1999-2016) y paso por 73 tipos diferentes de roca.

73 tipos de roca. SETENTA Y TRES.

Perdon, se que nadie pregunto. Pero mi cerebro dice que esto es informacion vital que el mundo necesita saber.

#InfoDump #Trenes #Suiza`,
      toneTag: 'INFO_DUMP',
      hyperfoci: ['trenes europeos', 'ingenieria', 'suiza'],
      wordCount: 148,
      isInfoDump: false,
      published: true,
    },
  })

  const post3 = await prisma.post.create({
    data: {
      authorId: user1.id,
      title: 'No puedo mas con el masking',
      content: `Hoy tuve una reunion de 3 horas donde tuve que pretender que estaba "presente" mientras mi cerebro estaba en 47 dimensiones paralelas.

Estoy agotada de fingir que tomo notas cuando en realidad estoy dibujando patrones geometricos. De sonreir y asentir cuando no escuche ni una palabra de los ultimos 20 minutos. De decir "si, claro, entiendo" cuando no tengo la menor idea de que me estan hablando.

El masking no es solo cansador, es DEVASTADOR para la autoestima. Porque al final del dia siento que nadie conoce a la persona real. Conocen a la version "aceptable" que construi para sobrevivir.

Alguien tiene estrategias para reducir el masking en ambientes laborales sin arriesgar el trabajo? Porque ya no me da el cuerpo.`,
      toneTag: 'RANT',
      hyperfoci: [],
      wordCount: 142,
      isInfoDump: false,
      published: true,
    },
  })

  const post4 = await prisma.post.create({
    data: {
      authorId: user2.id,
      title: 'Debate: Es el TDAH una discapacidad o una diferencia?',
      content: `Pregunta genuina, sin animo de ofender a nadie:

En la comunidad neurodivergente hay un debate constante sobre si el TDAH/autismo son "discapacidades" o "diferencias neurologicas". Entiendo ambas posturas:

A favor de "discapacidad": Nos da acceso a acomodaciones legales, reconoce que el mundo no esta disenado para nosotros, valida nuestras luchas reales.

A favor de "diferencia": Reduce el estigma, enfatiza fortalezas, no nos define por nuestras limitaciones.

Personalmente creo que depende del contexto. En mi trabajo, mi autismo es una ventaja (atencion al detalle, pensamiento sistematico). Pero en situaciones sociales, es claramente una barrera.

Que piensan ustedes? Y por favor, etiqueten su respuesta con tone tag para saber la intencion.`,
      toneTag: 'DEBATE',
      hyperfoci: ['neurodivergencia', 'activismo', 'identidad'],
      wordCount: 139,
      isInfoDump: false,
      published: true,
    },
  })

  const post5 = await prisma.post.create({
    data: {
      authorId: user1.id,
      title: 'Alguien sabe como organizar un sistema de riego automatico con Arduino?',
      content: `Mi sistema de acuaponia esta funcionando pero quiero agregar riego automatico para las macetas que tengo en el balcon (que NO son parte del sistema cerrado).

Necesito:
- Sensor de humedad del suelo
- Valvula solenoide para controlar el agua
- Timer programable (o usar el mismo Arduino)
- Algo que me avise al celular si el nivel de agua del tanque baja

Alguien hizo algo parecido? Estoy entre usar un ESP32 con WiFi integrado o quedarme con Arduino Uno + modulo WiFi separado.

Presupuesto: el que sea necesario porque ya perdi el control de mis finanzas con este hiperfoco.`,
      toneTag: 'QUESTION',
      hyperfoci: ['acuaponia', 'arduino', 'electronica'],
      wordCount: 110,
      isInfoDump: false,
      published: true,
    },
  })

  console.log(`Posts created: ${[post1.id, post2.id, post3.id, post4.id, post5.id].length}`)

  // ============================================================
  // Comments (Phase 3)
  // ============================================================

  const comment1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: user2.id,
      content: 'Yo empece con un huerto en mi balcon y ahora tengo un invernadero improvisado en el living. Mi familia piensa que estoy loco/a pero las plantas no me juzgan.',
      toneTag: 'ENTHUSIASM',
    },
  })

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: user1.id,
      content: 'LAS PLANTAS NO JUZGAN. Eso deberia ser el slogan de HyperHub.',
      toneTag: 'ENTHUSIASM',
      parentId: comment1.id,
    },
  })

  await prisma.comment.create({
    data: {
      postId: post3.id,
      authorId: user2.id,
      content: 'Te entiendo completamente. Una cosa que me funciono fue hablar con mi jefa directamente sobre mi autismo. No fue facil, pero ahora tengo permiso para usar auriculares en reuniones y tomar notas a mi manera (que incluye dibujar). No todos los ambientes son seguros para esto, pero si el tuyo lo es, vale la pena intentar.',
      toneTag: 'HELP',
    },
  })

  await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: user1.id,
      content: '73 TIPOS DE ROCA. Kai, nunca te disculpes por un info dump. Esto es exactamente lo que necesitaba saber hoy. Mi cerebro ahora quiere saber todo sobre geologia alpina.',
      toneTag: 'ENTHUSIASM',
    },
  })

  console.log('Comments seeded')

  // ============================================================
  // Reactions (Phase 3)
  // ============================================================

  await prisma.reaction.createMany({
    data: [
      { postId: post1.id, userId: user2.id, type: 'SAME_HERE' },
      { postId: post1.id, userId: user2.id, type: 'HYPERFOCUS' },
      { postId: post2.id, userId: user1.id, type: 'INFODUMP_THANKS' },
      { postId: post2.id, userId: user1.id, type: 'BRAIN_EXPLODE' },
      { postId: post3.id, userId: user2.id, type: 'SAME_HERE' },
      { postId: post3.id, userId: user2.id, type: 'HUG' },
      { postId: post3.id, userId: user2.id, type: 'SPOON_GIFT' },
      { postId: post4.id, userId: user1.id, type: 'BRAIN_EXPLODE' },
      { postId: post5.id, userId: user2.id, type: 'HYPERFOCUS' },
      // Reactions from user3
      { postId: post1.id, userId: user3.id, type: 'ENTHUSIASM' as any },
      { postId: post3.id, userId: user3.id, type: 'HUG' },
    ],
  })
  console.log('Reactions seeded')

  // ============================================================
  // Bookmarks (Phase 3)
  // ============================================================

  await prisma.bookmark.createMany({
    data: [
      { userId: user1.id, postId: post2.id, folder: 'Info Dumps Favoritos' },
      { userId: user1.id, postId: post4.id, folder: 'Para Reflexionar' },
      { userId: user2.id, postId: post1.id, folder: null },
      { userId: user2.id, postId: post3.id, folder: 'Importante' },
      { userId: user3.id, postId: post1.id, folder: 'Inspiracion' },
    ],
  })
  console.log('Bookmarks seeded')

  console.log('\n--- Phase 1-3 Seed Summary ---')
  console.log('  Users: 3')
  console.log('  Posts: 5')
  console.log('  Comments: 4')
  console.log('  Reactions: 11')
  console.log('  Bookmarks: 5')

  return { user1, user2, user3 }
}

// ============================================================
// Phase 4: Messaging, Conversations, Safe Exit
// ============================================================

async function seedPhase4(users: { user1: any; user2: any; user3: any }) {
  console.log('\nSeeding Phase 4: Messaging System...')

  const { user1, user2, user3 } = users

  // ----------------------------------------------------------
  // 1. Notification Preferences
  // ----------------------------------------------------------

  for (const user of [user1, user2, user3]) {
    await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        greenBattery: 'NORMAL',
        yellowBattery: 'LOW',
        redBattery: 'SILENT',
        lurkerBattery: 'SILENT',
        quietHoursEnabled: false,
        digestEnabled: true,
        digestIntervalMin: 30,
      },
      update: {},
    })
  }
  console.log('Created notification preferences for all users')

  // ----------------------------------------------------------
  // 2. Direct Conversation: user1 <-> user2
  // ----------------------------------------------------------

  const directConv = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      maxMembers: 2,
      toneTagRequired: true,
      slowModeSeconds: 0,
      lastMessageAt: new Date(),
      participants: {
        create: [
          { userId: user1.id, role: 'OWNER' },
          { userId: user2.id, role: 'MEMBER' },
        ],
      },
    },
  })
  console.log(`Created direct conversation: ${directConv.id}`)

  const directMessages = [
    { senderId: user1.id, content: 'Hey! Probaste la nueva config de preferencias sensoriales?', toneTag: 'ENTHUSIASM' as const, isSystem: false },
    { senderId: user2.id, content: 'Todavia no! Que cambio?', toneTag: 'QUESTION' as const, isSystem: false },
    { senderId: user1.id, content: 'Agregaron controles granulares de animacion. Podes configurar tolerancia por componente en vez de global. Es un game changer para diferencias de procesamiento visual.', toneTag: 'INFO_DUMP' as const, isSystem: false },
    { senderId: user2.id, content: 'Eso suena increible. Las animaciones del feed me estaban generando sobrecarga sensorial. El toggle global era demasiado brusco.', toneTag: 'RANT' as const, isSystem: false },
    { senderId: user1.id, content: 'Exacto! Anda a Settings > Sensory > Animation Tolerance. Podes previsualizar cada nivel antes de confirmar.', toneTag: 'HELP' as const, isSystem: false },
    { senderId: user2.id, content: 'Voy a probarlo ahora mismo. Gracias por el dato!', toneTag: 'ENTHUSIASM' as const, isSystem: false },
    { senderId: user1.id, content: 'Contame como te va. El modo contraste combina bien con animaciones reducidas tambien.', toneTag: 'INFO_DUMP' as const, isSystem: false },
  ]

  for (let i = 0; i < directMessages.length; i++) {
    const msg = directMessages[i]!
    await prisma.message.create({
      data: {
        conversationId: directConv.id,
        senderId: msg.senderId,
        content: msg.content,
        toneTag: msg.toneTag,
        status: 'DELIVERED',
        isSystem: msg.isSystem,
        createdAt: new Date(Date.now() - (directMessages.length - i) * 120000),
      },
    })
  }
  console.log(`Created ${directMessages.length} messages in direct conversation`)

  // ----------------------------------------------------------
  // 3. Group Conversation: Grupo de Estudio Neurodivergente
  // ----------------------------------------------------------

  const groupConv = await prisma.conversation.create({
    data: {
      type: 'GROUP',
      name: 'Grupo de Estudio Neurodivergente',
      description: 'Compartiendo recursos y estrategias para aprendices neurodivergentes',
      maxMembers: 20,
      toneTagRequired: true,
      slowModeSeconds: 30,
      lastMessageAt: new Date(),
      participants: {
        create: [
          { userId: user1.id, role: 'OWNER' },
          { userId: user2.id, role: 'ADMIN' },
          { userId: user3.id, role: 'MEMBER' },
        ],
      },
    },
  })
  console.log(`Created group conversation: ${groupConv.id}`)

  const groupMessages = [
    { senderId: user1.id, content: 'Bienvenidos al grupo de estudio! Los tone tags son obligatorios para que siempre sepamos la intencion de los mensajes.', toneTag: 'ENTHUSIASM' as const, isSystem: false },
    { senderId: user3.id, content: 'Que bueno estar aca. Pregunta rapida -- hay forma de configurar horas silenciosas para este grupo? Me abruman las notificaciones durante el tiempo de foco.', toneTag: 'QUESTION' as const, isSystem: false },
    { senderId: user2.id, content: 'Si! Anda a preferencias de notificacion y activa Quiet Hours. Podes poner horarios especificos. Ademas tu nivel de bateria ajusta la prioridad automaticamente.', toneTag: 'HELP' as const, isSystem: false },
    { senderId: user1.id, content: 'Quiero compartir algo que me frustra. Las apps de estudio estandar nunca tienen en cuenta las diferentes velocidades de procesamiento. Asumen que todos leen y absorben al mismo ritmo.', toneTag: 'RANT' as const, isSystem: false },
    { senderId: user3.id, content: 'MAL. Necesito releer las cosas 3-4 veces y no es porque no entienda -- mi cerebro procesa el texto diferente.', toneTag: 'DEBATE' as const, isSystem: false },
    { senderId: user2.id, content: 'Por eso existe HyperHub. El sistema de bateria respeta tu ritmo. Cuando estas en ROJO, los mensajes van a cola en vez de bombardearte.', toneTag: 'INFO_DUMP' as const, isSystem: false },
    { senderId: user1.id, content: 'Encontre un articulo genial sobre repeticion espaciada adaptada para cerebros TDAH. Lo comparto en el canal de recursos tambien.', toneTag: 'ENTHUSIASM' as const, isSystem: false },
  ]

  for (let i = 0; i < groupMessages.length; i++) {
    const msg = groupMessages[i]!
    await prisma.message.create({
      data: {
        conversationId: groupConv.id,
        senderId: msg.senderId,
        content: msg.content,
        toneTag: msg.toneTag,
        status: 'DELIVERED',
        isSystem: msg.isSystem,
        createdAt: new Date(Date.now() - (groupMessages.length - i) * 300000),
      },
    })
  }
  console.log(`Created ${groupMessages.length} messages in group conversation`)

  // ----------------------------------------------------------
  // 4. Safe Space Conversation
  // ----------------------------------------------------------

  const safeSpaceConv = await prisma.conversation.create({
    data: {
      type: 'SAFE_SPACE',
      name: 'Zona de Descompresion',
      description: 'Un espacio de baja estimulacion para cuando necesitas descomprimir. Sin presion de responder.',
      maxMembers: 10,
      toneTagRequired: true,
      slowModeSeconds: 60,
      lastMessageAt: new Date(),
      participants: {
        create: [
          { userId: user2.id, role: 'OWNER' },
          { userId: user1.id, role: 'MEMBER' },
          { userId: user3.id, role: 'MEMBER' },
        ],
      },
    },
  })
  console.log(`Created safe space: ${safeSpaceConv.id}`)

  const safeMessages = [
    { senderId: user2.id, content: 'Este espacio tiene slow mode de 60 segundos. Tomate tu tiempo. Sin apuro para responder nada.', toneTag: 'HELP' as const, isSystem: false },
    { senderId: user1.id, content: 'Tuve un dia super abrumador. Solo necesitaba un lugar tranquilo para existir un rato.', toneTag: 'RANT' as const, isSystem: false },
    { senderId: user3.id, content: 'Igual aca. La sobrecarga sensorial de la oficina fue intensa hoy. Agradecida por espacios como este.', toneTag: 'HELP' as const, isSystem: false },
    { senderId: user2.id, content: 'Son bienvenidos siempre. Recuerden que pueden usar el boton de Safe Exit si necesitan irse -- no hace falta explicar nada.', toneTag: 'ENTHUSIASM' as const, isSystem: false },
  ]

  for (let i = 0; i < safeMessages.length; i++) {
    const msg = safeMessages[i]!
    await prisma.message.create({
      data: {
        conversationId: safeSpaceConv.id,
        senderId: msg.senderId,
        content: msg.content,
        toneTag: msg.toneTag,
        status: 'DELIVERED',
        isSystem: msg.isSystem,
        createdAt: new Date(Date.now() - (safeMessages.length - i) * 600000),
      },
    })
  }
  console.log(`Created ${safeMessages.length} messages in safe space`)

  // ----------------------------------------------------------
  // 5. Safe Exit example
  // ----------------------------------------------------------

  const safeExit = await prisma.safeExit.create({
    data: {
      userId: user3.id,
      conversationId: safeSpaceConv.id,
      reason: 'SENSORY_OVERLOAD',
      customMessage: null,
      autoMessage: 'Sobrecarga sensorial -- me tomo un momento para descomprimir',
      exitedAt: new Date(Date.now() - 30 * 60 * 1000),
      returnedAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  })
  console.log(`Created safe exit example: ${safeExit.id}`)

  // System message for safe exit
  await prisma.message.create({
    data: {
      conversationId: safeSpaceConv.id,
      senderId: user3.id,
      content: 'Sobrecarga sensorial -- me tomo un momento para descomprimir',
      toneTag: 'HELP',
      isSystem: true,
      status: 'DELIVERED',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  })

  // Return message
  await prisma.message.create({
    data: {
      conversationId: safeSpaceConv.id,
      senderId: user3.id,
      content: 'Volvi de la pausa -- hola!',
      toneTag: 'ENTHUSIASM',
      isSystem: true,
      status: 'DELIVERED',
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  })
  console.log('Created safe exit system messages')

  // ----------------------------------------------------------
  // 6. Read Receipts
  // ----------------------------------------------------------

  const recentMessages = await prisma.message.findMany({
    where: { conversationId: directConv.id, senderId: user1.id },
    take: 3,
    orderBy: { createdAt: 'desc' },
  })

  for (const msg of recentMessages) {
    await prisma.messageRead.create({
      data: { messageId: msg.id, userId: user2.id },
    })
  }
  console.log(`Created ${recentMessages.length} read receipts`)

  // ----------------------------------------------------------
  // 7. Queued Message (battery-delayed)
  // ----------------------------------------------------------

  // Create a message from user1 to user2 that's queued (simulating RED battery)
  await prisma.message.create({
    data: {
      conversationId: directConv.id,
      senderId: user1.id,
      content: 'Cuando te sientas con energia -- sin apuro! Solo queria compartirte algo copado que encontre.',
      toneTag: 'ENTHUSIASM',
      status: 'QUEUED',
      isSystem: false,
    },
  })
  console.log('Created queued message example (battery-delayed)')

  // ----------------------------------------------------------
  // Summary
  // ----------------------------------------------------------

  const convCount = await prisma.conversation.count()
  const msgCount = await prisma.message.count()
  const exitCount = await prisma.safeExit.count()
  const readCount = await prisma.messageRead.count()
  const prefCount = await prisma.notificationPreference.count()

  console.log('\n--- Phase 4 Seed Summary ---')
  console.log(`  Conversations: ${convCount}`)
  console.log(`  Messages: ${msgCount}`)
  console.log(`  Safe Exits: ${exitCount}`)
  console.log(`  Read Receipts: ${readCount}`)
  console.log(`  Notification Preferences: ${prefCount}`)
}

// ============================================================
// Main: Run all phases sequentially
// ============================================================

async function main() {
  console.log('============================================')
  console.log('  HyperHub Seed -- All Phases (1-4)')
  console.log('============================================\n')

  const users = await seedPhase1to3()
  await seedPhase4(users)

  console.log('\n============================================')
  console.log('  All seeds completed successfully!')
  console.log('============================================')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
