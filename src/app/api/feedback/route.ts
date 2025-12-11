import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti vartotojo atsiliepimus
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    // Patikrinti ar vartotojas jau paliko atsiliepimą
    const feedback = await prisma.feedback.findFirst({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Feedback GET klaida:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// POST - Sukurti naują atsiliepimą
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const body = await req.json()
    const {
      easeOfUse,
      speed,
      colorPalette,
      fontStyle,
      fontReadability,
      contentClarity,
      contentAmount,
      tone,
      reliability,
      communication,
      comment
    } = body

    // Validacija
    const metrics = [
      easeOfUse,
      speed,
      colorPalette,
      fontStyle,
      fontReadability,
      contentClarity,
      contentAmount,
      tone,
      reliability,
      communication
    ]

    for (const metric of metrics) {
      if (!metric || metric < 1 || metric > 10) {
        return NextResponse.json(
          { error: 'Visos metrikos turi būti nuo 1 iki 10' },
          { status: 400 }
        )
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: session.user.id,
        easeOfUse: parseInt(easeOfUse),
        speed: parseInt(speed),
        colorPalette: parseInt(colorPalette),
        fontStyle: parseInt(fontStyle),
        fontReadability: parseInt(fontReadability),
        contentClarity: parseInt(contentClarity),
        contentAmount: parseInt(contentAmount),
        tone: parseInt(tone),
        reliability: parseInt(reliability),
        communication: parseInt(communication),
        comment: comment || null
      }
    })

    return NextResponse.json({ feedback }, { status: 201 })
  } catch (error) {
    console.error('Feedback POST klaida:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

