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

    if (userRole === 'USER') {
      // USER mato tik savo privatų kambarį su ADMIN
      let userRoom = await prisma.chatRoom.findFirst({
        where: { 
          type: 'ADMIN_USER',
          userId: session.user.id
        }
      })
      
      // Jei kambario nėra - sukurti automatiškai
      if (!userRoom) {
        userRoom = await prisma.chatRoom.create({
          data: {
            name: `Chat su ${session.user.name}`,
            type: 'ADMIN_USER',
            pin: '5678', // Default PIN
            userId: session.user.id
          }
        })
      }
      
      rooms.push({
        id: userRoom.id,
        name: 'Chat su Admin',
        type: userRoom.type
      })
    }

    if (userRole === 'ADMIN') {
      // ADMIN mato visus privačius USER kambarius
      const userRooms = await prisma.chatRoom.findMany({
        where: { 
          type: 'ADMIN_USER',
          userId: { not: null }
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      
      for (const room of userRooms) {
        rooms.push({
          id: room.id,
          name: `Chat su ${room.owner?.name || 'Vartotoju'}`,
          type: room.type,
          userId: room.userId
        })
      }
    }

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Klaida gaunant chat room\'us:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

