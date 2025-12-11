'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'

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
  questions: Question[]
}

export default function SurveyRespondPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const requiredQuestions = survey?.questions.filter(q => q.required) || []
      const unansweredRequired = requiredQuestions.filter(
        q => !answers[q.id] || !answers[q.id].trim()
      )

      if (unansweredRequired.length > 0) {
        alert('Prašome atsakyti į visus privalomus klausimus')
        setIsSubmitting(false)
        return
      }

      const res = await fetch(`/api/surveys/${params.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer
          }))
        })
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        alert(data.error || 'Klaida siunčiant atsakymus')
      }
    } catch (error) {
      console.error('Klaida:', error)
      alert('Klaida siunčiant atsakymus')
    } finally {
      setIsSubmitting(false)
    }
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ačiū už atsakymus!
          </h2>
          <p className="text-gray-600 mb-6">
            Jūsų atsakymai buvo sėkmingai išsaugoti
          </p>
          <Link
            href="/user/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Grįžti į dashboard
          </Link>
        </div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link
            href="/user/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Grįžti
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-gray-600">{survey.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions.map((question, index) => {
            const options = parseOptions(question.options)
            
            return (
              <div key={question.id} className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-900 mb-2">
                    {index + 1}. {question.question}
                    {question.required && <span className="text-red-600 ml-1">*</span>}
                  </label>

                  {question.type === 'TEXT' && (
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={e => handleAnswerChange(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Įveskite savo atsakymą..."
                      required={question.required}
                    />
                  )}

                  {question.type === 'SINGLE_CHOICE' && options.length > 0 && (
                    <div className="space-y-2">
                      {options.map((option: string) => (
                        <label
                          key={option}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={e => handleAnswerChange(question.id, e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            required={question.required}
                          />
                          <span className="text-gray-900">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'MULTIPLE_CHOICE' && options.length > 0 && (
                    <div className="space-y-2">
                      {options.map((option: string) => {
                        const selectedOptions = answers[question.id]?.split(',') || []
                        return (
                          <label
                            key={option}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              value={option}
                              checked={selectedOptions.includes(option)}
                              onChange={e => {
                                const currentSelected = answers[question.id]?.split(',').filter(s => s) || []
                                if (e.target.checked) {
                                  handleAnswerChange(question.id, [...currentSelected, option].join(','))
                                } else {
                                  handleAnswerChange(question.id, currentSelected.filter(o => o !== option).join(','))
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {question.type === 'RATING' && (
                    <div>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, rating.toString())}
                            className={`w-12 h-12 rounded-lg font-medium transition-colors ${
                              answers[question.id] === rating.toString()
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {rating}
                          </button>
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
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex-1">
                        <input
                          type="radio"
                          name={question.id}
                          value="Taip"
                          checked={answers[question.id] === 'Taip'}
                          onChange={e => handleAnswerChange(question.id, e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          required={question.required}
                        />
                        <span className="text-lg font-medium text-gray-900">Taip</span>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex-1">
                        <input
                          type="radio"
                          name={question.id}
                          value="Ne"
                          checked={answers[question.id] === 'Ne'}
                          onChange={e => handleAnswerChange(question.id, e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          required={question.required}
                        />
                        <span className="text-lg font-medium text-gray-900">Ne</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 text-lg font-medium"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Siunčiama...' : 'Pateikti atsakymus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

