import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Pradėti naują sesiją
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const body = await req.json()
    const { ipAddress, userAgent } = body

    // Sukurti naują sesiją
    const userSession = await prisma.userSession.create({
      data: {
        userId: session.user.id,
        ipAddress,
        userAgent,
        startTime: new Date(),
        lastActive: new Date()
      }
    })

    // Log LOGIN activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'LOGIN',
        metadata: {
          ipAddress,
          userAgent,
          sessionId: userSession.id
        }
      }
    })

    return NextResponse.json({ sessionId: userSession.id })
  } catch (error) {
    console.error('Klaida kuriant sesiją:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// PATCH - Atnaujinti sesijos aktyvumą
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID privalomas' }, { status: 400 })
    }

    // Atnaujinti lastActive
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { lastActive: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Klaida atnaujinant sesiją:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

// PUT - Užbaigti sesiją
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID privalomas' }, { status: 400 })
    }

    // Gauti esamą sesiją
    const userSession = await prisma.userSession.findUnique({
      where: { id: sessionId }
    })

    if (!userSession) {
      return NextResponse.json({ error: 'Sesija nerasta' }, { status: 404 })
    }

    // Apskaičiuoti trukmę
    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - userSession.startTime.getTime()) / 1000)

    // Atnaujinti sesiją
    await prisma.userSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        duration
      }
    })

    // Log LOGOUT activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'LOGOUT',
        metadata: {
          sessionId,
          duration
        }
      }
    })

    return NextResponse.json({ success: true, duration })
  } catch (error) {
    console.error('Klaida užbaigiant sesiją:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

