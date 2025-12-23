import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Sukurti chat PIN pirma karta
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Tik USER gali sukurti chat PIN' }, { status: 403 })
    }

    const { pin, confirmPin } = await req.json()

    // Validacija
    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ error: 'PIN privalomas' }, { status: 400 })
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN turi būti 4 skaitmenys' }, { status: 400 })
    }

    if (pin !== confirmPin) {
      return NextResponse.json({ error: 'PIN nesutampa' }, { status: 400 })
    }

    // Patikrinti ar jau turi PIN
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { chatPin: true }
    })

    if (existingUser?.chatPin) {
      return NextResponse.json({ error: 'Chat PIN jau sukurtas' }, { status: 400 })
    }

    // Sukurti PIN
    await prisma.user.update({
      where: { id: session.user.id },
      data: { chatPin: pin }
    })

    // Sukurti arba atnaujinti ChatRoom su šiuo PIN
    const room = await prisma.chatRoom.findFirst({
      where: {
        type: 'ADMIN_USER',
        userId: session.user.id
      }
    })

    if (room) {
      // Atnaujinti egzistuojantį kambarį
      await prisma.chatRoom.update({
        where: { id: room.id },
        data: { pin: pin }
      })
    } else {
      // Sukurti naują kambarį
      await prisma.chatRoom.create({
        data: {
          name: `Chat su ${session.user.name}`,
          type: 'ADMIN_USER',
          pin: pin,
          userId: session.user.id
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Chat PIN sėkmingai sukurtas!'
    })
  } catch (error) {
    console.error('Klaida kuriant chat PIN:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

