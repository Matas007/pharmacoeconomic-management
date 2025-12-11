import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti vieną anketą su klausimais
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const survey = await prisma.survey.findUnique({
      where: {
        id: params.id
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
      }
    })

    if (!survey) {
      return NextResponse.json(
        { error: 'Anketa nerasta' },
        { status: 404 }
      )
    }

    return NextResponse.json(survey)
  } catch (error) {
    console.error('Klaida gaunant anketą:', error)
    return NextResponse.json(
      { error: 'Serverio klaida' },
      { status: 500 }
    )
  }
}

// DELETE - Ištrinti anketą (tik savininkas)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const survey = await prisma.survey.findUnique({
      where: { id: params.id }
    })

    if (!survey) {
      return NextResponse.json(
        { error: 'Anketa nerasta' },
        { status: 404 }
      )
    }

    if (survey.createdById !== session.user.id) {
      return NextResponse.json(
        { error: 'Neturite teisių ištrinti šios anketos' },
        { status: 403 }
      )
    }

    await prisma.survey.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Anketa ištrinta' })
  } catch (error) {
    console.error('Klaida trinant anketą:', error)
    return NextResponse.json(
      { error: 'Serverio klaida' },
      { status: 500 }
    )
  }
}

