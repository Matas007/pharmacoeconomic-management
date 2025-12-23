import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti visas IT specialisto užduotis
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'IT_SPECIALIST') {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        subtasks: {
          orderBy: {
            order: 'asc'
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

// POST - Sukurti naują užduotį
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'IT_SPECIALIST') {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, status, priority, startDate, endDate, progress, color } = body

    // Validacija
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Pavadinimas, pradžios ir pabaigos datos yra privalomi' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        progress: 0, // Pradžioje 0%, apskaičiuojamas pagal subtask'us
        color: color || '#2c3e50',
        userId: session.user.id
      },
      include: {
        subtasks: true
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Klaida kuriant užduotį:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

