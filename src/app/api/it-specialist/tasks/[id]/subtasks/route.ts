import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Funkcija progress apskaičiavimui
async function calculateProgress(taskId: string) {
  const subtasks = await prisma.subtask.findMany({
    where: { taskId }
  })
  
  if (subtasks.length === 0) return 0
  
  const completedCount = subtasks.filter(st => st.completed).length
  return Math.round((completedCount / subtasks.length) * 100)
}

// POST - Sukurti naują subtask
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'IT_SPECIALIST') {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const { title } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Pavadinimas privalomas' }, { status: 400 })
    }

    // Patikrinti ar task priklauso vartotojui
    const task = await prisma.task.findUnique({
      where: { id: params.id }
    })

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: 'Užduotis nerasta' }, { status: 404 })
    }

    // Gauti didžiausią order numerį
    const maxOrder = await prisma.subtask.findFirst({
      where: { taskId: params.id },
      orderBy: { order: 'desc' }
    })

    const subtask = await prisma.subtask.create({
      data: {
        title,
        taskId: params.id,
        order: maxOrder ? maxOrder.order + 1 : 0
      }
    })

    // Atnaujinti progress
    const progress = await calculateProgress(params.id)
    await prisma.task.update({
      where: { id: params.id },
      data: { progress }
    })

    return NextResponse.json(subtask, { status: 201 })
  } catch (error) {
    console.error('Klaida kuriant subtask:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

