import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nepakankamos teisės' }, { status: 403 })
    }

    // Naudojame Prisma ORM su include
    const requests = await prisma.request.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Klaida gaunant užklausas:', error)
    return NextResponse.json(
      { error: 'Vidinė serverio klaida' },
      { status: 500 }
    )
  }
}
