import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti chat žinutes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ error: 'RoomId privalomas' }, { status: 400 })
    }

    // Patikrinti prieigą prie kambario
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json({ error: 'Kambarys nerastas' }, { status: 404 })
    }

    const userRole = session.user.role

    // Tikrinti prieigą
    if (room.type === 'EMPLOYEE') {
      if (!['ADMIN', 'IT_SPECIALIST', 'QUALITY_EVALUATOR'].includes(userRole)) {
        return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
      }
    } else if (room.type === 'ADMIN_USER') {
      if (userRole === 'USER' && room.userId !== session.user.id) {
        return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
      } else if (!['ADMIN', 'USER'].includes(userRole)) {
        return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
      }
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        roomId: roomId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 100 // Paskutinės 100 žinučių
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Klaida gaunant žinutes:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// POST - Siųsti žinutę
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const { roomId, content } = await req.json()

    if (!roomId || !content || content.trim() === '') {
      return NextResponse.json({ error: 'RoomId ir content privalomi' }, { status: 400 })
    }

    // Patikrinti prieigą prie kambario
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json({ error: 'Kambarys nerastas' }, { status: 404 })
    }

    const userRole = session.user.role

    // Tikrinti prieigą
    if (room.type === 'EMPLOYEE') {
      if (!['ADMIN', 'IT_SPECIALIST', 'QUALITY_EVALUATOR'].includes(userRole)) {
        return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
      }
    } else if (room.type === 'ADMIN_USER') {
      if (userRole === 'USER' && room.userId !== session.user.id) {
        return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
      } else if (!['ADMIN', 'USER'].includes(userRole)) {
        return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        roomId: roomId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Klaida siunčiant žinutę:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

