import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Patikrinti ar USER turi sukūręs chat PIN
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'USER') {
      // Ne USER rolės neturi custom PIN
      return NextResponse.json({ 
        hasPin: true, // ADMIN/kiti visada "turi" (naudoja room.pin)
        needsSetup: false 
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { chatPin: true }
    })

    return NextResponse.json({
      hasPin: !!user?.chatPin,
      needsSetup: !user?.chatPin
    })
  } catch (error) {
    console.error('Klaida tikrinant PIN:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// POST - Sukurti/pakeisti USER chat PIN
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Tik USER gali nustatyti custom PIN' }, { status: 403 })
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

    // Atnaujinti User.chatPin (ChatRoom.pin lieka 5678!)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { chatPin: pin }
    })

    return NextResponse.json({
      success: true,
      message: 'Chat PIN sėkmingai nustatytas!'
    })
  } catch (error) {
    console.error('Klaida nustatant PIN:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}
