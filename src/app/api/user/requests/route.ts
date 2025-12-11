import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    // Naudojame Prisma ORM
    const requests = await prisma.request.findMany({
      where: {
        userId: session.user.id
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const { title, description, priority, filters } = await request.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Pavadinimas ir aprašymas yra privalomi' },
        { status: 400 }
      )
    }

    const newRequest = await prisma.request.create({
      data: {
        title,
        description,
        priority,
        filters,
        userId: session.user.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error('Klaida kuriant užklausą:', error)
    return NextResponse.json(
      { error: 'Vidinė serverio klaida' },
      { status: 500 }
    )
  }
}
