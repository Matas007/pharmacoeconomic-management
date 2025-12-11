import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti visus priedus pagal subtask
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['IT_SPECIALIST', 'QUALITY_EVALUATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const subtaskId = searchParams.get('subtaskId')

    if (!subtaskId) {
      return NextResponse.json({ error: 'subtaskId yra privalomas' }, { status: 400 })
    }

    const attachments = await prisma.attachment.findMany({
      where: { subtaskId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(attachments)
  } catch (error) {
    console.error('Klaida gaunant priedus:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// POST - Įkelti naują priedą
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['IT_SPECIALIST', 'QUALITY_EVALUATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    const body = await req.json()
    const { subtaskId, fileName, fileUrl, fileSize, fileType } = body

    if (!subtaskId || !fileName || !fileUrl || !fileSize || !fileType) {
      return NextResponse.json(
        { error: 'Visi laukai yra privalomi' },
        { status: 400 }
      )
    }

    // Patikrinti ar subtask egzistuoja
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { task: true }
    })

    if (!subtask) {
      return NextResponse.json({ error: 'Subtask nerastas' }, { status: 404 })
    }

    // Sukurti naują priedą
    const attachment = await prisma.attachment.create({
      data: {
        subtaskId,
        fileName,
        fileUrl,
        fileSize,
        fileType,
        uploadedBy: session.user.role
      }
    })

    return NextResponse.json(attachment)
  } catch (error) {
    console.error('Klaida įkeliant priedą:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// DELETE - Ištrinti priedą
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['IT_SPECIALIST', 'QUALITY_EVALUATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id yra privalomas' }, { status: 400 })
    }

    // Patikrinti ar attachment egzistuoja ir ar vartotojas gali jį ištrinti
    const attachment = await prisma.attachment.findUnique({
      where: { id }
    })

    if (!attachment) {
      return NextResponse.json({ error: 'Priedas nerastas' }, { status: 404 })
    }

    // Tik tas pats vartotojas (role) gali ištrinti
    if (attachment.uploadedBy !== session.user.role) {
      return NextResponse.json({ error: 'Neturite teisės ištrinti šio priedo' }, { status: 403 })
    }

    await prisma.attachment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Klaida trinant priedą:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

