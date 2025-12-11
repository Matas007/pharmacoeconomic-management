import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Vartotojas atsako į anketą
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const body = await req.json()
    const { answers } = body

    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: 'Trūksta atsakymų' },
        { status: 400 }
      )
    }

    // Patikrinti ar anketa egzistuoja ir ar yra aktyvi
    const survey = await prisma.survey.findUnique({
      where: { id: params.id },
      include: {
        questions: true
      }
    })

    if (!survey) {
      return NextResponse.json(
        { error: 'Anketa nerasta' },
        { status: 404 }
      )
    }

    if (!survey.isActive) {
      return NextResponse.json(
        { error: 'Ši anketa nebėra aktyvi' },
        { status: 400 }
      )
    }

    // Patikrinti ar vartotojas jau yra atsakęs į šią anketą
    const existingResponse = await prisma.surveyResponse.findFirst({
      where: {
        surveyId: params.id,
        userId: session.user.id
      }
    })

    if (existingResponse) {
      return NextResponse.json(
        { error: 'Jūs jau atsakėte į šią anketą' },
        { status: 400 }
      )
    }

    // Sukurti atsakymą su visais atsakais
    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: params.id,
        userId: session.user.id,
        answers: {
          create: answers.map((a: any) => ({
            questionId: a.questionId,
            answer: a.answer
          }))
        }
      },
      include: {
        answers: true
      }
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Klaida siunčiant atsakymą:', error)
    return NextResponse.json(
      { error: 'Serverio klaida' },
      { status: 500 }
    )
  }
}

