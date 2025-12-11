import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti visas IT specialistų užduotis (read-only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'QUALITY_EVALUATOR') {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    // Gauti visas užduotis iš visų IT specialistų
    const tasks = await prisma.task.findMany({
      include: {
        subtasks: {
          orderBy: {
            order: 'asc'
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Klaida gaunant užduotis:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

