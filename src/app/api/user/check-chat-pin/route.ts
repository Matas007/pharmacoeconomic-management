import { NextResponse } from 'next/server'
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
      // Ne USER rolės vartotojai visada turi prieigą
      return NextResponse.json({ hasPin: true, needsSetup: false })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { chatPin: true }
    })

    const hasPin = !!user?.chatPin
    
    return NextResponse.json({ 
      hasPin,
      needsSetup: !hasPin // Jei nėra PIN - reikia setup
    })
  } catch (error) {
    console.error('Klaida tikrinant chat PIN:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

