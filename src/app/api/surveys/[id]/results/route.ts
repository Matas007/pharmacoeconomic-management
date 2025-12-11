import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Gauti anketos rezultatus su statistika
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautorizuotas' }, { status: 401 })
    }

    // Gauti anketą su klausimais ir atsakymais
    const survey = await prisma.survey.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answers: {
              include: {
                response: {
                  include: {
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            responses: true,
            questions: true
          }
        }
      }
    })

    if (!survey) {
      return NextResponse.json({ error: 'Anketa nerasta' }, { status: 404 })
    }

    // Procesinti statistiką kiekvienam klausimui
    const questionsWithStats = survey.questions.map(question => {
      const totalResponses = question.answers.length

      let stats: any = { totalResponses }

      if (question.type === 'RATING') {
        // Reitingų statistika
        const ratings = question.answers.map(a => parseFloat(a.answer))
        const average = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0

        const distribution: Record<string, number> = {}
        for (let i = 1; i <= 10; i++) {
          distribution[i] = ratings.filter(r => r === i).length
        }

        stats = {
          totalResponses,
          average,
          distribution
        }
      } else if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE' || question.type === 'YES_NO') {
        // Pasirinkimų statistika
        const distribution: Record<string, number> = {}
        
        question.answers.forEach(answer => {
          // MULTIPLE_CHOICE gali turėti kelis atsakymus (atskirti kableliais)
          if (question.type === 'MULTIPLE_CHOICE') {
            const selectedOptions = answer.answer.split(',').filter(s => s.trim())
            selectedOptions.forEach(option => {
              distribution[option.trim()] = (distribution[option.trim()] || 0) + 1
            })
          } else {
            distribution[answer.answer] = (distribution[answer.answer] || 0) + 1
          }
        })

        stats = {
          totalResponses,
          distribution
        }

        if (question.type === 'YES_NO') {
          const yesCount = distribution['Taip'] || 0
          stats.yesPercentage = totalResponses > 0 ? (yesCount / totalResponses) * 100 : 0
        }
      } else if (question.type === 'TEXT') {
        // Tekstinių atsakymų sąrašas
        const responses = question.answers.map(answer => ({
          answer: answer.answer,
          user: answer.response.user.name,
          createdAt: answer.createdAt
        }))

        stats = {
          totalResponses,
          responses
        }
      }

      return {
        id: question.id,
        question: question.question,
        type: question.type,
        stats
      }
    })

    const result = {
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        createdAt: survey.createdAt,
        _count: survey._count
      },
      questions: questionsWithStats
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Klaida gaunant rezultatus:', error)
    return NextResponse.json(
      { error: 'Serverio klaida' },
      { status: 500 }
    )
  }
}
