import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - Atnaujinti užduotį
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Patikrinti ar užduotis priklauso vartotojui
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Užduotis nerasta' }, { status: 404 })
    }

    if (existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: 'Neturite teisės redaguoti šios užduoties' }, { status: 403 })
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        // progress pašalintas - apskaičiuojamas automatiškai iš subtask'ų
        ...(color && { color })
      },
      include: {
        subtasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Klaida atnaujinant užduotį:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// DELETE - Ištrinti užduotį
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'IT_SPECIALIST') {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    // Patikrinti ar užduotis priklauso vartotojui
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Užduotis nerasta' }, { status: 404 })
    }

    if (existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: 'Neturite teisės ištrinti šios užduoties' }, { status: 403 })
    }

    await prisma.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Užduotis ištrinta' })
  } catch (error) {
    console.error('Klaida trinant užduotį:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

