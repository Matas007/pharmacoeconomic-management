import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti visas anketas (tik aktyvias ir neatsakytas vartotojams)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    // Filtruojame anketas, į kurias vartotojas dar neatsakė
    const surveys = await prisma.survey.findMany({
      where: {
        isActive: true,
        // Nefiltruoti anketų, į kurias vartotojas jau atsakė
        responses: {
          none: {
            userId: session.user.id
          }
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        questions: {
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(surveys)
  } catch (error) {
    console.error('Klaida gaunant anketas:', error)
    return NextResponse.json(
      { error: 'Serverio klaida' },
      { status: 500 }
    )
  }
}

// POST - Sukurti naują anketą (tik IT Specialist)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'IT_SPECIALIST') {
      return NextResponse.json(
        { error: 'Tik IT specialistai gali kurti anketas' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { title, description, questions } = body

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Trūksta būtinų laukų' },
        { status: 400 }
      )
    }

    // Sukurti anketą su klausimais
    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        createdById: session.user.id,
        questions: {
          create: questions.map((q: any, index: number) => ({
            question: q.question,
            type: q.type,
            options: q.options || null,
            required: q.required || false,
            order: index
          }))
        }
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(survey, { status: 201 })
  } catch (error) {
    console.error('Klaida kuriant anketą:', error)
    return NextResponse.json(
      { error: 'Serverio klaida' },
      { status: 500 }
    )
  }
}

