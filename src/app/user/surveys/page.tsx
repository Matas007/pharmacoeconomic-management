'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FileText, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Survey {
  id: string
  title: string
  description: string
  createdAt: string
}

export default function UserSurveysPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Link
            href="/user/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Grįžti į skydelį
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Anketos</h1>
          <p className="text-gray-600 mt-2">
            Atsakykite į anketas ir padėkite mums tobulėti
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Kraunama...</p>
          </div>
        ) : surveys.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Šiuo metu nėra aktyvių anketų
            </h3>
            <p className="text-gray-600">
              Grįžkite vėliau - galbūt bus naujų anketų
            </p>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {survey.title}
                      </h3>
                      {survey.description && (
                        <p className="text-gray-600 mb-4">{survey.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>~5 min.</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/user/surveys/${survey.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Pradėti
                    </Link>
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

