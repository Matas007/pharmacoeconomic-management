'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PlusCircle, MinusCircle, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type QuestionType = 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'RATING' | 'YES_NO'

interface Question {
  id: string
  question: string
  type: QuestionType
  options: string[]
  required: boolean
}

export default function NewSurveyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: crypto.randomUUID(),
      question: '',
      type: 'TEXT',
      options: [],
      required: false
    }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        question: '',
        type: 'TEXT',
        options: [],
        required: false
      }
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      )
    )
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId
          ? { ...q, options: [...q.options, ''] }
          : q
      )
    )
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, i) => (i === optionIndex ? value : opt))
            }
          : q
      )
    )
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) }
          : q
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!title.trim()) {
        alert('Įveskite anketos pavadinimą')
        setIsSubmitting(false)
        return
      }

      if (questions.some(q => !q.question.trim())) {
        alert('Visi klausimai turi turėti tekstą')
        setIsSubmitting(false)
        return
      }

      if (
        questions.some(
          q => (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && q.options.filter(o => o.trim()).length < 2
        )
      ) {
        alert('Pasirinkimo klausimai turi turėti bent 2 pasirinkimus')
        setIsSubmitting(false)
        return
      }

      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          questions: questions.map(q => ({
            question: q.question,
            type: q.type,
            options: (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') ? q.options.filter(o => o.trim()) : null,
            required: q.required
          }))
        })
      })

      if (res.ok) {
        alert('Anketa sėkmingai sukurta! ✅')
        router.push('/it-specialist/surveys')
      } else {
        const data = await res.json()
        alert(data.error || 'Klaida kuriant anketą')
      }
    } catch (error) {
      console.error('Klaida:', error)
      alert('Klaida siunčiant anketą')
    } finally {
      setIsSubmitting(false)
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
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link
            href="/it-specialist/surveys"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Grįžti į anketas
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Sukurti naują anketą</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anketos pavadinimas *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pvz: Vartotojų pasitenkinimo tyrimas"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aprašymas (neprivaloma)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Trumpas anketos aprašymas..."
              />
            </div>

            <hr className="my-6" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Klausimai</h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <PlusCircle className="w-5 h-5" />
                  Pridėti klausimą
                </button>
              </div>

              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-md font-medium text-gray-900">
                      Klausimas {index + 1}
                    </h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <MinusCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Klausimo tekstas *
                      </label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={e =>
                          updateQuestion(question.id, 'question', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Įveskite klausimą..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Klausimo tipas
                        </label>
                        <select
                          value={question.type}
                          onChange={e =>
                            updateQuestion(question.id, 'type', e.target.value as QuestionType)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="TEXT">Tekstas</option>
                          <option value="SINGLE_CHOICE">Vienas atsakymas</option>
                          <option value="MULTIPLE_CHOICE">Keli atsakymai</option>
                          <option value="RATING">Reitingas (1-10)</option>
                          <option value="YES_NO">Taip/Ne</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={e =>
                              updateQuestion(question.id, 'required', e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Privalomas</span>
                        </label>
                      </div>
                    </div>

                    {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pasirinkimo variantai
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={e =>
                                  updateOption(question.id, optIndex, e.target.value)
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Variantas ${optIndex + 1}`}
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(question.id, optIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <MinusCircle className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(question.id)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Pridėti variantą
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link
                href="/it-specialist/surveys"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Atšaukti
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? 'Kuriama...' : 'Sukurti anketą'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

