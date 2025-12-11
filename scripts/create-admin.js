const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUsers() {
  try {
    console.log('🚀 Kuriami sistemos vartotojai...\n')

    // 1. Sukurti Admin vartotoją
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12)
      const admin = await prisma.user.create({
        data: {
          name: 'Administratorius',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'ADMIN'
        }
      })
      console.log('✅ Admin vartotojas sukurtas:')
      console.log('   El. paštas: admin@example.com')
      console.log('   Slaptažodis: admin123')
      console.log('   Rolė: Darbuotojas (ADMIN)')
      console.log('   ID:', admin.id)
      console.log('')
    } else {
      console.log('ℹ️  Admin vartotojas jau egzistuoja:', existingAdmin.email)
      console.log('')
    }

    // 2. Sukurti Quality Evaluator vartotoją
    const existingQE = await prisma.user.findFirst({
      where: { email: 'quality@example.com' }
    })

    if (!existingQE) {
      const hashedPassword = await bcrypt.hash('quality123', 12)
      const qualityEvaluator = await prisma.user.create({
        data: {
          name: 'Kokybės vertintojas',
          email: 'quality@example.com',
          password: hashedPassword,
          role: 'QUALITY_EVALUATOR'
        }
      })
      console.log('✅ Kokybės vertintojo vartotojas sukurtas:')
      console.log('   El. paštas: quality@example.com')
      console.log('   Slaptažodis: quality123')
      console.log('   Rolė: Darbuotojas (QUALITY_EVALUATOR)')
      console.log('   ID:', qualityEvaluator.id)
      console.log('')
    } else {
      console.log('ℹ️  Kokybės vertintojo vartotojas jau egzistuoja:', existingQE.email)
      console.log('')
    }

    // 3. Sukurti IT Specialist vartotoją
    const existingIT = await prisma.user.findFirst({
      where: { email: 'it@example.com' }
    })

    if (!existingIT) {
      const hashedPassword = await bcrypt.hash('it123', 12)
      const itSpecialist = await prisma.user.create({
        data: {
          name: 'IT Specialistas',
          email: 'it@example.com',
          password: hashedPassword,
          role: 'IT_SPECIALIST'
        }
      })
      console.log('✅ IT Specialisto vartotojas sukurtas:')
      console.log('   El. paštas: it@example.com')
      console.log('   Slaptažodis: it123')
      console.log('   Rolė: Darbuotojas (IT_SPECIALIST)')
      console.log('   ID:', itSpecialist.id)
      console.log('')
    } else {
      console.log('ℹ️  IT Specialisto vartotojas jau egzistuoja:', existingIT.email)
      console.log('')
    }

    // 4. Sukurti Test User vartotoją
    const existingUser = await prisma.user.findFirst({
      where: { email: 'user@example.com' }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('user123', 12)
      const user = await prisma.user.create({
        data: {
          name: 'Testas Vartotojas',
          email: 'user@example.com',
          password: hashedPassword,
          role: 'USER'
        }
      })
      console.log('✅ Testas vartotojas sukurtas:')
      console.log('   El. paštas: user@example.com')
      console.log('   Slaptažodis: user123')
      console.log('   Rolė: Vartotojas (USER)')
      console.log('   ID:', user.id)
      console.log('')
    } else {
      console.log('ℹ️  Testas vartotojas jau egzistuoja:', existingUser.email)
      console.log('')
    }

    console.log('✨ Visi vartotojai sukurti!')
    console.log('')
    console.log('📋 Prisijungimo duomenys:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('👔 DARBUOTOJAI:')
    console.log('   1. Admin:')
    console.log('      • admin@example.com / admin123')
    console.log('   2. Kokybės vertintojas:')
    console.log('      • quality@example.com / quality123')
    console.log('   3. IT Specialistas:')
    console.log('      • it@example.com / it123')
    console.log('')
    console.log('👤 VARTOTOJAS:')
    console.log('   • user@example.com / user123')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ Klaida kuriant vartotojus:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUsers()
