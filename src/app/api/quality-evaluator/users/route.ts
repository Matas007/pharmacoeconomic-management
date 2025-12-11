import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'QUALITY_EVALUATOR') {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const segment = searchParams.get('segment')

    // Gauti visus USER rolės vartotojus su jų užklausomis
    const users = await prisma.user.findMany({
      where: {
        role: 'USER'
      },
      include: {
        requests: {
          select: {
            id: true,
            createdAt: true,
            status: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Apskaičiuoti segmentus
    const usersWithSegments = users.map(user => {
      const totalRequests = user.requests.length
      const recentRequests = user.requests.filter(
        r => new Date(r.createdAt) >= thirtyDaysAgo
      ).length
      const accountAge = now.getTime() - new Date(user.createdAt).getTime()
      const daysOld = accountAge / (1000 * 60 * 60 * 24)

      let userSegment = 'NEAKTYVUS' // Default

      // VIP: 5+ užklausų per visą laiką (AUKŠČIAUSIAS PRIORITETAS)
      if (totalRequests >= 5) {
        userSegment = 'VIP'
      }
      // Aktyvus: 1-4 užklausos (bet kokios užklausos, tik ne VIP)
      else if (totalRequests >= 1 && totalRequests <= 4) {
        userSegment = 'AKTYVUS'
      }
      // Naujas: ≤7 dienų nuo registracijos IR 0 užklausų
      else if (daysOld <= 7 && totalRequests === 0) {
        userSegment = 'NAUJAS'
      }
      // Neaktyvus: >7 dienų IR 0 užklausų (ABI SĄLYGOS BŪTINOS!)
      else if (daysOld > 7 && totalRequests === 0) {
        userSegment = 'NEAKTYVUS'
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        segment: userSegment,
        stats: {
          totalRequests,
          recentRequests,
          lastRequestDate: user.requests[0]?.createdAt || null
        }
      }
    })

    // Filtruoti pagal segmentą jei nurodyta
    const filteredUsers = segment
      ? usersWithSegments.filter(u => u.segment === segment.toUpperCase())
      : usersWithSegments

    // Suskaičiuoti kiekvieno segmento vartotojų skaičių
    const segmentCounts = {
      VIP: usersWithSegments.filter(u => u.segment === 'VIP').length,
      AKTYVUS: usersWithSegments.filter(u => u.segment === 'AKTYVUS').length,
      NAUJAS: usersWithSegments.filter(u => u.segment === 'NAUJAS').length,
      NEAKTYVUS: usersWithSegments.filter(u => u.segment === 'NEAKTYVUS').length,
      TOTAL: usersWithSegments.length
    }

    return NextResponse.json({
      users: filteredUsers,
      counts: segmentCounts
    })
  } catch (error) {
    console.error('Klaida gaunant vartotojus:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}

