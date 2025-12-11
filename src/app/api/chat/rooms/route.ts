import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti chat room'us pagal vartotojo rolę
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const userRole = session.user.role

    let rooms = []

    if (['ADMIN', 'IT_SPECIALIST', 'QUALITY_EVALUATOR'].includes(userRole)) {
      // Darbuotojai mato darbuotojų chat
      const employeeRoom = await prisma.chatRoom.findFirst({
        where: { type: 'EMPLOYEE' }
      })
      if (employeeRoom) {
        rooms.push({
          id: employeeRoom.id,
          name: employeeRoom.name,
          type: employeeRoom.type
        })
      }
    }

    if (userRole === 'ADMIN' || userRole === 'USER') {
      // Admin ir User mato admin-user chat
      const adminUserRoom = await prisma.chatRoom.findFirst({
        where: { type: 'ADMIN_USER' }
      })
      if (adminUserRoom) {
        rooms.push({
          id: adminUserRoom.id,
          name: adminUserRoom.name,
          type: adminUserRoom.type
        })
      }
    }

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Klaida gaunant chat room\'us:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

