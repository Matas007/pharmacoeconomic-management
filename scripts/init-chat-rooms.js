const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initChatRooms() {
  try {
    console.log('🚀 Inicializuojami chat room\'ai...')

    // Darbuotojų chat (ADMIN, IT_SPECIALIST, QUALITY_EVALUATOR)
    const employeeRoom = await prisma.chatRoom.upsert({
      where: { id: 'employee-room' },
      update: {},
      create: {
        id: 'employee-room',
        name: 'Darbuotojų chat',
        type: 'EMPLOYEE',
        pin: '1234' // Darbuotojų PIN
      }
    })

    console.log('✅ Darbuotojų chat sukurtas:', {
      name: employeeRoom.name,
      pin: employeeRoom.pin
    })

    // Admin-Vartotojo chat
    const adminUserRoom = await prisma.chatRoom.upsert({
      where: { id: 'admin-user-room' },
      update: {},
      create: {
        id: 'admin-user-room',
        name: 'Admin-Vartotojo chat',
        type: 'ADMIN_USER',
        pin: '5678' // Admin-Vartotojo PIN
      }
    })

    console.log('✅ Admin-Vartotojo chat sukurtas:', {
      name: adminUserRoom.name,
      pin: adminUserRoom.pin
    })

    console.log('\n📌 PIN kodai:')
    console.log('   Darbuotojų chat: 1234')
    console.log('   Admin-Vartotojo chat: 5678')

  } catch (error) {
    console.error('❌ Klaida inicializuojant chat room\'us:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initChatRooms()

