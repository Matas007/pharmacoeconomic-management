'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeft, BarChart3, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  question: string
  type: string
  options: any
  required: boolean
  order: number
}

interface Survey {
  id: string
  title: string
  description: string
  isActive: boolean
  createdAt: string
  questions: Question[]
  _count: {
    responses: number
  }
}

export default function SurveyReviewPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSurvey()
  }, [params.id])

  const fetchSurvey = async () => {
    try {
      const res = await fetch(`/api/surveys/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setSurvey(data)
      }
    } catch (error) {
      console.error('Klaida:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Ar tikrai norite ištrinti šią anketą?')) {
      return
    }

    try {
      const res = await fetch(`/api/surveys/${params.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('Anketa ištrinta')
        router.push('/it-specialist/surveys')
      } else {
        const data = await res.json()
        alert(data.error || 'Klaida trinant anketą')
      }
    } catch (error) {
      console.error('Klaida:', error)
      alert('Klaida trinant anketą')
    }
  }

  const parseOptions = (options: any): string[] => {
    if (!options) return []
    if (typeof options === 'string') {
      try {
        return JSON.parse(options)
      } catch {
        return []
      }
    }
    if (Array.isArray(options)) return options
    return []
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Kraunama...</p>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Anketa nerasta</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/it-specialist/surveys"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Grįžti į anketas
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/it-specialist/surveys/${params.id}/results`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <BarChart3 className="w-4 h-4" />
              Rezultatai
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Ištrinti
            </button>
          </div>
        </div>

        {/* Survey Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
              {survey.description && (
                <p className="text-gray-600">{survey.description}</p>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                survey.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {survey.isActive ? 'Aktyvi' : 'Neaktyvi'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Atsakymų:</span> {survey._count.responses}
            </div>
            <div>
              <span className="font-medium">Sukurta:</span>{' '}
              {new Date(survey.createdAt).toLocaleDateString('lt-LT')}
            </div>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Klausimai ({survey.questions.length})
          </h2>

          {survey.questions.map((question, index) => {
            const options = parseOptions(question.options)

            return (
              <div key={question.id} className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <label className="block text-lg font-medium text-gray-900">
                      {index + 1}. {question.question}
                      {question.required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {question.type === 'TEXT' && 'Tekstas'}
                      {question.type === 'SINGLE_CHOICE' && 'Vienas atsakymas'}
                      {question.type === 'MULTIPLE_CHOICE' && 'Keli atsakymai'}
                      {question.type === 'RATING' && 'Reitingas (1-10)'}
                      {question.type === 'YES_NO' && 'Taip/Ne'}
                    </span>
                  </div>

                  {question.type === 'TEXT' && (
                    <div className="bg-gray-50 rounded p-3 text-gray-500 italic">
                      Laisvo teksto atsakymas...
                    </div>
                  )}

                  {question.type === 'SINGLE_CHOICE' && options.length > 0 && (
                    <div className="space-y-2">
                      {options.map((option: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          <span className="text-gray-700">{option}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'MULTIPLE_CHOICE' && options.length > 0 && (
                    <div className="space-y-2">
                      {options.map((option: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                          <span className="text-gray-700">{option}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'RATING' && (
                    <div>
                      <div className="flex gap-2 mb-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                          <div
                            key={rating}
                            className="w-12 h-12 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-medium"
                          >
                            {rating}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Prasčiausiai</span>
                        <span>Puikiai</span>
                      </div>
                    </div>
                  )}

                  {question.type === 'YES_NO' && (
                    <div className="flex gap-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg flex-1">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        <span className="text-lg font-medium text-gray-700">Taip</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg flex-1">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        <span className="text-lg font-medium text-gray-700">Ne</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

