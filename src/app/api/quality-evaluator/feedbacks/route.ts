import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti visus atsiliepimus (tik kokybės vertintojui)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'QUALITY_EVALUATOR') {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    const feedbacks = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Apskaičiuoti statistiką
    const stats = {
      total: feedbacks.length,
      averages: {
        easeOfUse: 0,
        speed: 0,
        colorPalette: 0,
        fontStyle: 0,
        fontReadability: 0,
        contentClarity: 0,
        contentAmount: 0,
        tone: 0,
        reliability: 0,
        communication: 0,
        overall: 0
      }
    }

    if (feedbacks.length > 0) {
      const totals = feedbacks.reduce((acc, fb) => ({
        easeOfUse: acc.easeOfUse + fb.easeOfUse,
        speed: acc.speed + fb.speed,
        colorPalette: acc.colorPalette + fb.colorPalette,
        fontStyle: acc.fontStyle + fb.fontStyle,
        fontReadability: acc.fontReadability + fb.fontReadability,
        contentClarity: acc.contentClarity + fb.contentClarity,
        contentAmount: acc.contentAmount + fb.contentAmount,
        tone: acc.tone + fb.tone,
        reliability: acc.reliability + fb.reliability,
        communication: acc.communication + fb.communication
      }), {
        easeOfUse: 0,
        speed: 0,
        colorPalette: 0,
        fontStyle: 0,
        fontReadability: 0,
        contentClarity: 0,
        contentAmount: 0,
        tone: 0,
        reliability: 0,
        communication: 0
      })

      const count = feedbacks.length
      stats.averages = {
        easeOfUse: Number((totals.easeOfUse / count).toFixed(2)),
        speed: Number((totals.speed / count).toFixed(2)),
        colorPalette: Number((totals.colorPalette / count).toFixed(2)),
        fontStyle: Number((totals.fontStyle / count).toFixed(2)),
        fontReadability: Number((totals.fontReadability / count).toFixed(2)),
        contentClarity: Number((totals.contentClarity / count).toFixed(2)),
        contentAmount: Number((totals.contentAmount / count).toFixed(2)),
        tone: Number((totals.tone / count).toFixed(2)),
        reliability: Number((totals.reliability / count).toFixed(2)),
        communication: Number((totals.communication / count).toFixed(2)),
        overall: Number((
          (totals.easeOfUse + totals.speed + totals.colorPalette + 
           totals.fontStyle + totals.fontReadability + totals.contentClarity + 
           totals.contentAmount + totals.tone + totals.reliability + 
           totals.communication) / (count * 10)
        ).toFixed(2))
      }
    }

    return NextResponse.json({ feedbacks, stats })
  } catch (error) {
    console.error('Quality evaluator feedbacks GET klaida:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

