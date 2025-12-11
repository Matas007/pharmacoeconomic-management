import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti visus komentarus pagal attachment
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['IT_SPECIALIST', 'QUALITY_EVALUATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const attachmentId = searchParams.get('attachmentId')

    if (!attachmentId) {
      return NextResponse.json({ error: 'attachmentId yra privalomas' }, { status: 400 })
    }

    const comments = await prisma.attachmentComment.findMany({
      where: { attachmentId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Klaida gaunant komentarus:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// POST - Pridėti naują komentarą (IT_SPECIALIST ir QUALITY_EVALUATOR)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['IT_SPECIALIST', 'QUALITY_EVALUATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Tik IT ir Kokybės specialistai gali komentuoti' }, { status: 403 })
    }

    const body = await req.json()
    const { attachmentId, comment } = body

    if (!attachmentId || !comment || !comment.trim()) {
      return NextResponse.json(
        { error: 'attachmentId ir comment yra privalomi' },
        { status: 400 }
      )
    }

    // Patikrinti ar attachment egzistuoja
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId }
    })

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment nerastas' }, { status: 404 })
    }

    // Sukurti naują komentarą
    const attachmentComment = await prisma.attachmentComment.create({
      data: {
        attachmentId,
        comment: comment.trim(),
        authorRole: session.user.role,
        authorName: session.user.name || 'Nežinomas'
      }
    })

    return NextResponse.json(attachmentComment)
  } catch (error) {
    console.error('Klaida pridedant komentarą:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// PATCH - Atnaujinti komentarą (tik savo)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['IT_SPECIALIST', 'QUALITY_EVALUATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    const body = await req.json()
    const { id, comment } = body

    if (!id || !comment || !comment.trim()) {
      return NextResponse.json(
        { error: 'id ir comment yra privalomi' },
        { status: 400 }
      )
    }

    // Patikrinti ar komentaras priklauso vartotojui
    const existingComment = await prisma.attachmentComment.findUnique({
      where: { id }
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Komentaras nerastas' }, { status: 404 })
    }

    if (existingComment.authorRole !== session.user.role || 
        existingComment.authorName !== session.user.name) {
      return NextResponse.json({ error: 'Galite redaguoti tik savo komentarus' }, { status: 403 })
    }

    const updatedComment = await prisma.attachmentComment.update({
      where: { id },
      data: { comment: comment.trim() }
    })

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Klaida atnaujinant komentarą:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// DELETE - Ištrinti komentarą (tik savo)
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

    // Patikrinti ar komentaras priklauso vartotojui
    const existingComment = await prisma.attachmentComment.findUnique({
      where: { id }
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Komentaras nerastas' }, { status: 404 })
    }

    if (existingComment.authorRole !== session.user.role || 
        existingComment.authorName !== session.user.name) {
      return NextResponse.json({ error: 'Galite trinti tik savo komentarus' }, { status: 403 })
    }

    await prisma.attachmentComment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Klaida trinant komentarą:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

