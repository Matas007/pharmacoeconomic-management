import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nepakankamos teisės' }, { status: 403 })
    }

    const { requestId, adminNotes } = await request.json()

    if (!requestId) {
      return NextResponse.json(
        { error: 'Trūksta užklausos ID' },
        { status: 400 }
      )
    }

    // Naudojame Prisma ORM
    const updatedRequest = await prisma.request.update({
      where: {
        id: requestId
      },
      data: {
        adminNotes: adminNotes
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Klaida atnaujinant pastabas:', error)
    return NextResponse.json(
      { error: 'Vidinė serverio klaida' },
      { status: 500 }
    )
  }
}
