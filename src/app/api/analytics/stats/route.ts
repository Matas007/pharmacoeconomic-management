import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti analytics statistiką
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'QUALITY_EVALUATOR') {
      return NextResponse.json({ error: 'Neturite prieigos' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '7' // dienų skaičius

    const daysAgo = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // ========================================
    // UŽKLAUSŲ STATISTIKA
    // ========================================

    // 1. Dead hang requests (pradėjo bet nebaigė)
    const abandonedRequests = await prisma.requestDraft.findMany({
      where: {
        startedAt: {
          gte: startDate
        },
        abandoned: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    })

    const totalAbandoned = abandonedRequests.length

    // 2. Request completion time statistics
    const completedDrafts = await prisma.requestDraft.findMany({
      where: {
        startedAt: {
          gte: startDate
        },
        completedAt: {
          not: null
        },
        abandoned: false,
        duration: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Bendras vidurkis
    const avgRequestDuration = completedDrafts.length > 0
      ? Math.round(completedDrafts.reduce((acc, d) => acc + (d.duration || 0), 0) / completedDrafts.length)
      : 0

    // Kiekvieno vartotojo vidurkis
    const userCompletionTimes = await prisma.requestDraft.groupBy({
      by: ['userId'],
      where: {
        startedAt: {
          gte: startDate
        },
        completedAt: {
          not: null
        },
        abandoned: false,
        duration: {
          not: null
        }
      },
      _avg: {
        duration: true
      },
      _count: {
        userId: true
      }
    })

    const userRequestStats = await Promise.all(
      userCompletionTimes.map(async (stat) => {
        const user = await prisma.user.findUnique({
          where: { id: stat.userId },
          select: {
            id: true,
            name: true,
            email: true
          }
        })
        return {
          ...user,
          avgDuration: Math.round(stat._avg.duration || 0),
          requestCount: stat._count.userId
        }
      })
    )

    // 3. Conversion rate (completed vs abandoned)
    // Skaičiuojame tik užbaigtus ir nebaigtus (ne tarpiniuose stadijose)
    const completedCount = completedDrafts.length
    const requestConversionRate = (completedCount + totalAbandoned) > 0
      ? Math.round((completedCount / (completedCount + totalAbandoned)) * 100)
      : 0

    // ========================================
    // ATSILIEPIMŲ STATISTIKA
    // ========================================

    // 4. Dead hang feedback (pradėjo bet nebaigė)
    const abandonedFeedback = await prisma.feedbackDraft.findMany({
      where: {
        startedAt: {
          gte: startDate
        },
        abandoned: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    })

    const totalAbandonedFeedback = abandonedFeedback.length

    // 5. Feedback completion time statistics
    const completedFeedback = await prisma.feedbackDraft.findMany({
      where: {
        startedAt: {
          gte: startDate
        },
        completedAt: {
          not: null
        },
        abandoned: false,
        duration: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Bendras vidurkis
    const avgFeedbackDuration = completedFeedback.length > 0
      ? Math.round(completedFeedback.reduce((acc, d) => acc + (d.duration || 0), 0) / completedFeedback.length)
      : 0

    // 6. Feedback conversion rate
    // Skaičiuojame tik užbaigtus ir nebaigtus (ne tarpiniuose stadijose)
    const feedbackCompletedCount = completedFeedback.length
    const feedbackConversionRate = (feedbackCompletedCount + totalAbandonedFeedback) > 0
      ? Math.round((feedbackCompletedCount / (feedbackCompletedCount + totalAbandonedFeedback)) * 100)
      : 0

    // ========================================
    // ATSILIEPIMŲ REITINGAI
    // ========================================

    // 7. Atsiliepimų įvertinimų statistika
    const feedbackRatings = await prisma.feedback.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        easeOfUse: true,
        speed: true,
        colorPalette: true,
        fontStyle: true,
        fontReadability: true,
        contentClarity: true,
        contentAmount: true,
        tone: true,
        reliability: true,
        communication: true
      }
    })

    const metrics = [
      { key: 'easeOfUse', label: 'Paprastumas naudotis' },
      { key: 'speed', label: 'Greitis' },
      { key: 'colorPalette', label: 'Spalvų paletė' },
      { key: 'fontStyle', label: 'Šrifto stilius' },
      { key: 'fontReadability', label: 'Šrifto skaitomumas' },
      { key: 'contentClarity', label: 'Turinio aiškumas' },
      { key: 'contentAmount', label: 'Turinio kiekis' },
      { key: 'tone', label: 'Tonas' },
      { key: 'reliability', label: 'Patikimumas' },
      { key: 'communication', label: 'Komunikacija' }
    ]

    let bestMetric = null
    let worstMetric = null
    let overallAverage = 0

    if (feedbackRatings.length > 0) {
      const averages = metrics.map(metric => {
        const sum = feedbackRatings.reduce((acc, f) => acc + (f[metric.key as keyof typeof f] as number || 0), 0)
        const avg = sum / feedbackRatings.length
        return {
          key: metric.key,
          label: metric.label,
          average: Number(avg.toFixed(2))
        }
      })

      // Rasti geriausią ir blogiausią
      averages.sort((a, b) => b.average - a.average)
      bestMetric = averages[0]
      worstMetric = averages[averages.length - 1]

      // Bendras vidurkis
      const totalSum = averages.reduce((acc, m) => acc + m.average, 0)
      overallAverage = Number((totalSum / averages.length).toFixed(2))
    }

    // ========================================
    // BENDROS METRIKOS
    // ========================================

    // 8. Aktyvūs vartotojai (bent viena veikla)
    const activeUsers = await prisma.user.findMany({
      where: {
        OR: [
          {
            requestDrafts: {
              some: {
                startedAt: {
                  gte: startDate
                }
              }
            }
          },
          {
            feedbackDrafts: {
              some: {
                startedAt: {
                  gte: startDate
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    return NextResponse.json({
      // Užklausų metrikos
      requestMetrics: {
        totalAbandoned,
        avgRequestDuration,
        completedCount,
        conversionRate: requestConversionRate,
        userStats: userRequestStats,
        recentAbandoned: abandonedRequests.slice(0, 10)
      },
      // Atsiliepimų metrikos
      feedbackMetrics: {
        totalAbandoned: totalAbandonedFeedback,
        avgFeedbackDuration,
        completedCount: feedbackCompletedCount,
        conversionRate: feedbackConversionRate,
        recentAbandoned: abandonedFeedback.slice(0, 10),
        // Reitingų statistika
        ratings: {
          bestMetric,
          worstMetric,
          overallAverage,
          totalFeedbacks: feedbackRatings.length
        }
      },
      // Bendros metrikos
      activeUsersCount: activeUsers.length,
      period: daysAgo
    })
  } catch (error) {
    console.error('Klaida gaunant statistiką:', error)
    return NextResponse.json({ error: 'Serverio klaida' }, { status: 500 })
  }
}
