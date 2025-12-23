'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PlusCircle, FileText, Users, BarChart3, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Survey {
  id: string
  title: string
  description: string
  isActive: boolean
  createdAt: string
  createdBy: {
    name: string
  }
  _count: {
    responses: number
  }
}

export default function SurveysPage() {
  const { data: session } = useSession()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      const res = await fetch('/api/surveys')
      if (res.ok) {
        const data = await res.json()
        setSurveys(data)
      }
    } catch (error) {
      console.error('Klaida:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šią anketą?')) {
      return
    }

    try {
      const res = await fetch(`/api/surveys/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('Anketa ištrinta')
        fetchSurveys()
      } else {
        const data = await res.json()
        alert(data.error || 'Klaida trinant anketą')
      }
    } catch (error) {
      console.error('Klaida:', error)
      alert('Klaida trinant anketą')
    }
  }

  if (session?.user?.role !== 'IT_SPECIALIST') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Neturite prieigos prie šio puslapio</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Anketos</h1>
              <p className="text-gray-600 mt-2">
                Kurkite ir valdykite vartotojų anketas
              </p>
            </div>
            <Link
              href="/it-specialist/surveys/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircle className="w-5 h-5" />
              Nauja anketa
            </Link>
          </div>

          <div className="flex gap-4 text-sm">
            <Link
              href="/it-specialist/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Grįžti į skydelį
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Kraunama...</p>
          </div>
        ) : surveys.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Dar nėra anketų
            </h3>
            <p className="text-gray-600 mb-6">
              Sukurkite pirmą anketą ir surinkite vartotojų atsiliepimus
            </p>
            <Link
              href="/it-specialist/surveys/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircle className="w-5 h-5" />
              Sukurti pirmą anketą
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {surveys.map(survey => (
              <div
                key={survey.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {survey.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            survey.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {survey.isActive ? 'Aktyvi' : 'Neaktyvi'}
                        </span>
                      </div>

                      {survey.description && (
                        <p className="text-gray-600 mb-4">{survey.description}</p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{survey._count.responses} atsakymų</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Sukūrė: {survey.createdBy.name}</span>
                        </div>
                        <div>
                          {new Date(survey.createdAt).toLocaleDateString('lt-LT')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/it-specialist/surveys/${survey.id}/results`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Peržiūrėti rezultatus"
                      >
                        <BarChart3 className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Ištrinti"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

