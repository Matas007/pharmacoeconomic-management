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

// PATCH - Atnaujinti subtask (toggle completed)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'IT_SPECIALIST') {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const { completed, title } = await req.json()

    const subtask = await prisma.subtask.findUnique({
      where: { id: params.id },
      include: { task: true }
    })

    if (!subtask || subtask.task.userId !== session.user.id) {
      return NextResponse.json({ error: 'Subtask nerasta' }, { status: 404 })
    }

    const updated = await prisma.subtask.update({
      where: { id: params.id },
      data: {
        ...(completed !== undefined && { 
          completed,
          completedAt: completed ? new Date() : null
        }),
        ...(title && { title })
      }
    })

    // Atnaujinti progress
    const progress = await calculateProgress(subtask.taskId)
    await prisma.task.update({
      where: { id: subtask.taskId },
      data: { progress }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Klaida atnaujinant subtask:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// DELETE - Ištrinti subtask
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'IT_SPECIALIST') {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const subtask = await prisma.subtask.findUnique({
      where: { id: params.id },
      include: { task: true }
    })

    if (!subtask || subtask.task.userId !== session.user.id) {
      return NextResponse.json({ error: 'Subtask nerasta' }, { status: 404 })
    }

    const taskId = subtask.taskId

    await prisma.subtask.delete({
      where: { id: params.id }
    })

    // Atnaujinti progress
    const progress = await calculateProgress(taskId)
    await prisma.task.update({
      where: { id: taskId },
      data: { progress }
    })

    return NextResponse.json({ message: 'Subtask ištrinta' })
  } catch (error) {
    console.error('Klaida trinant subtask:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

