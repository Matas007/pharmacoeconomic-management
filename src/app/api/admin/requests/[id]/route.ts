import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nepakankamos teisės' }, { status: 403 })
    }

    // Naudojame Prisma ORM
    const requestData = await prisma.request.findUnique({
      where: {
        id: params.id
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

    if (!requestData) {
      return NextResponse.json({ error: 'Užklausa nerasta' }, { status: 404 })
    }

    return NextResponse.json(requestData)
  } catch (error) {
    console.error('Klaida gaunant užklausą:', error)
    return NextResponse.json(
      { error: 'Vidinė serverio klaida' },
      { status: 500 }
    )
  }
}
