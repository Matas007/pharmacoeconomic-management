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

    const { requestId, status } = await request.json()

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Trūksta reikalingų parametrų' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Neteisingas statusas' },
        { status: 400 }
      )
    }

    const updatedRequest = await prisma.request.update({
      where: {
        id: requestId
      },
      data: {
        status
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
    console.error('Klaida atnaujinant statusą:', error)
    return NextResponse.json(
      { error: 'Vidinė serverio klaida' },
      { status: 500 }
    )
  }
}
