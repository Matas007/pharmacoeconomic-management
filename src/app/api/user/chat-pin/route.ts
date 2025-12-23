import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti dabartinį chat PIN
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { chatPin: true }
    })

    return NextResponse.json({ 
      chatPin: user?.chatPin || '5678', // Default jei nenustatytas
      isCustom: !!user?.chatPin
    })
  } catch (error) {
    console.error('Klaida gaunant chat PIN:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// POST - Nustatyti naują chat PIN
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Tik USER gali keisti chat PIN' }, { status: 403 })
    }

    const { pin } = await req.json()

    // Validacija
    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ error: 'PIN privalomas' }, { status: 400 })
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN turi būti 4 skaitmenys' }, { status: 400 })
    }

    // Atnaujinti USER chatPin
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { chatPin: pin }
    })

    // Atnaujinti ChatRoom PIN (jei kambarys jau egzistuoja)
    await prisma.chatRoom.updateMany({
      where: {
        type: 'ADMIN_USER',
        userId: session.user.id
      },
      data: { pin: pin }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Chat PIN sėkmingai pakeistas',
      chatPin: updatedUser.chatPin
    })
  } catch (error) {
    console.error('Klaida keičiant chat PIN:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// DELETE - Atstatyti į default PIN (5678)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Tik USER gali keisti chat PIN' }, { status: 403 })
    }

    // Ištrinti custom PIN (grįš prie default)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { chatPin: null }
    })

    // Atnaujinti ChatRoom PIN į default
    await prisma.chatRoom.updateMany({
      where: {
        type: 'ADMIN_USER',
        userId: session.user.id
      },
      data: { pin: '5678' }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Chat PIN atstatytas į numatytąjį (5678)'
    })
  } catch (error) {
    console.error('Klaida atkuriant chat PIN:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

