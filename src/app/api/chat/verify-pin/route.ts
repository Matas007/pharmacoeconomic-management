import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const MAX_ATTEMPTS = 3
const BLOCK_DURATION_MS = 10 * 60 * 1000 // 10 minučių

// POST - Tikrinti PIN kodą
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const { roomId, pin } = await req.json()

    if (!roomId || !pin) {
      return NextResponse.json({ error: 'RoomId ir PIN privalomi' }, { status: 400 })
    }

    // Gauti chat room
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json({ error: 'Chat room nerastas' }, { status: 404 })
    }

    // Patikrinti prieigą
    const userRole = session.user.role

    // Patikrinti ar vartotojas turi prieigą prie šio room
    if (room.type === 'EMPLOYEE') {
      if (!['ADMIN', 'IT_SPECIALIST', 'QUALITY_EVALUATOR'].includes(userRole)) {
        return NextResponse.json({ error: 'Neturite prieigos prie šio chat' }, { status: 403 })
      }
    } else if (room.type === 'ADMIN_USER') {
      // ADMIN gali prieiti prie visų USER kambarių
      if (userRole === 'ADMIN') {
        // OK
      } 
      // USER gali prieiti tik prie savo kambario
      else if (userRole === 'USER') {
        if (room.userId !== session.user.id) {
          return NextResponse.json({ error: 'Neturite prieigos prie šio chat' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: 'Neturite prieigos prie šio chat' }, { status: 403 })
      }
    }

    // Gauti ar sukurti ChatAccess įrašą
    let access = await prisma.chatAccess.findUnique({
      where: {
        userId_roomId: {
          userId: session.user.id,
          roomId: roomId
        }
      }
    })

    const now = new Date()

    if (!access) {
      access = await prisma.chatAccess.create({
        data: {
          userId: session.user.id,
          roomId: roomId,
          attempts: 0
        }
      })
    }

    // Patikrinti ar vartotojas užblokuotas
    if (access.blockedUntil && access.blockedUntil > now) {
      const remainingMs = access.blockedUntil.getTime() - now.getTime()
      const remainingMinutes = Math.ceil(remainingMs / 60000)
      
      return NextResponse.json({
        error: 'Užblokuotas',
        blocked: true,
        remainingMinutes,
        message: `Jūs esate užblokuotas dar ${remainingMinutes} min. dėl per daug neteisingų bandymų.`
      }, { status: 429 })
    }

    // Patikrinti PIN
    if (pin === room.pin) {
      // Teisingas PIN - nustatyti attempts į 0
      await prisma.chatAccess.update({
        where: { id: access.id },
        data: {
          attempts: 0,
          blockedUntil: null,
          lastAttemptAt: now
        }
      })

      return NextResponse.json({
        success: true,
        message: 'PIN teisingas',
        room: {
          id: room.id,
          name: room.name,
          type: room.type
        }
      })
    } else {
      // Neteisingas PIN - padidinti attempts
      const newAttempts = access.attempts + 1
      const updateData: any = {
        attempts: newAttempts,
        lastAttemptAt: now
      }

      // Jei pasiektas limitas - užblokuoti
      if (newAttempts >= MAX_ATTEMPTS) {
        updateData.blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MS)
        updateData.attempts = 0 // Reset attempts after block
      }

      await prisma.chatAccess.update({
        where: { id: access.id },
        data: updateData
      })

      const remainingAttempts = MAX_ATTEMPTS - newAttempts

      if (newAttempts >= MAX_ATTEMPTS) {
        return NextResponse.json({
          error: 'Per daug bandymų',
          blocked: true,
          remainingMinutes: 10,
          message: `Jūs esate užblokuotas 10 minučių dėl ${MAX_ATTEMPTS} neteisingų bandymų.`
        }, { status: 429 })
      }

      return NextResponse.json({
        error: 'Neteisingas PIN',
        attempts: newAttempts,
        remainingAttempts,
        message: `Neteisingas PIN. Liko bandymų: ${remainingAttempts}`
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Klaida tikrinant PIN:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

