import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Pradėti užklausos pildymą
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    // Sukurti draft
    const draft = await prisma.requestDraft.create({
      data: {
        userId: session.user.id,
        startedAt: new Date()
      }
    })

    return NextResponse.json({ draftId: draft.id })
  } catch (error) {
    console.error('Klaida kuriant draft:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// PATCH - Atnaujinti draft (auto-save)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const body = await req.json()
    const { draftId, formData } = body

    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID privalomas' }, { status: 400 })
    }

    // Atnaujinti draft su form data
    await prisma.requestDraft.update({
      where: { id: draftId },
      data: { formData }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Klaida atnaujinant draft:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// PUT - Užbaigti draft (submit arba abandon)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const body = await req.json()
    const { draftId, completed, abandoned } = body

    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID privalomas' }, { status: 400 })
    }

    // Gauti draft
    const draft = await prisma.requestDraft.findUnique({
      where: { id: draftId }
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft nerastas' }, { status: 404 })
    }

    // Apskaičiuoti trukmę
    const completedAt = new Date()
    const duration = Math.floor((completedAt.getTime() - draft.startedAt.getTime()) / 1000)

    // Atnaujinti draft
    await prisma.requestDraft.update({
      where: { id: draftId },
      data: {
        completedAt,
        duration,
        abandoned: abandoned || false
      }
    })

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: completed ? 'REQUEST_COMPLETED' : 'REQUEST_ABANDONED',
        entityType: 'RequestDraft',
        entityId: draftId,
        metadata: {
          duration
        }
      }
    })

    return NextResponse.json({ success: true, duration })
  } catch (error) {
    console.error('Klaida užbaigiant draft:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

