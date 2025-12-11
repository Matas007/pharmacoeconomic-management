'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Users, Calendar, BarChart3 as BarChartIcon, Eye } from 'lucide-react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface QuestionStats {
  id: string
  question: string
  type: string
  stats: any
}

interface Survey {
  id: string
  title: string
  description: string
  createdAt: string
  _count: {
    responses: number
    questions: number
  }
}

interface ResultsData {
  survey: Survey
  questions: QuestionStats[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

export default function SurveyResultsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const [results, setResults] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [params.id])

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/surveys/${params.id}/results`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Klaida:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderChart = (question: QuestionStats) => {
    if (question.type === 'RATING') {
      const chartData = Object.entries(question.stats.distribution || {}).map(([rating, count]) => ({
        rating: `${rating}★`,
        count: count as number
      }))

      return (
        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {question.stats.average?.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-gray-600">Vidutinis įvertinimas</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" name="Atsakymų skaičius" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    }

    if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') {
      const chartData = Object.entries(question.stats.distribution || {}).map(([option, count]) => ({
        name: option,
        value: count as number
      })).filter(item => item.value > 0)

      return (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : '0%'}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex items-center">
            <div className="w-full space-y-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (question.type === 'YES_NO') {
      const chartData = Object.entries(question.stats.distribution || {}).map(([option, count]) => ({
        name: option,
        value: count as number
      }))

      return (
        <div className="mt-6">
          <div className="mb-4 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {question.stats.yesPercentage?.toFixed(0) || '0'}%
            </div>
            <div className="text-sm text-gray-600">Atsakė &quot;Taip&quot;</div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : '0%'}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10B981" />
                <Cell fill="#EF4444" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )
    }

    if (question.type === 'TEXT') {
      return (
        <div className="mt-6 space-y-3">
          {question.stats.responses?.map((resp: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-800 mb-2">{resp.answer}</p>
              <div className="text-xs text-gray-500">
                {resp.user} • {new Date(resp.createdAt).toLocaleDateString('lt-LT')}
              </div>
            </div>
          )) || <p className="text-gray-500 italic">Nėra atsakymų</p>}
        </div>
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Kraunama...</p>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Rezultatai nerasti</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/it-specialist/surveys"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Grįžti į anketas
          </Link>

          <Link
            href={`/it-specialist/surveys/${params.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Eye className="w-4 h-4" />
            Peržiūrėti anketą
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {results.survey.title}
          </h1>
          {results.survey.description && (
            <p className="text-gray-600 mb-4">{results.survey.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {results.survey._count.responses}
                </div>
                <div className="text-sm text-blue-700">Atsakymų</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <BarChartIcon className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {results.survey._count.questions}
                </div>
                <div className="text-sm text-green-700">Klausimų</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-sm font-medium text-purple-900">
                  {new Date(results.survey.createdAt).toLocaleDateString('lt-LT')}
                </div>
                <div className="text-sm text-purple-700">Sukurta</div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions & Charts */}
        <div className="space-y-6">
          {results.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {index + 1}. {question.question}
                </h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {question.type === 'TEXT' && 'Tekstas'}
                  {question.type === 'SINGLE_CHOICE' && 'Vienas atsakymas'}
                  {question.type === 'MULTIPLE_CHOICE' && 'Keli atsakymai'}
                  {question.type === 'RATING' && 'Reitingas'}
                  {question.type === 'YES_NO' && 'Taip/Ne'}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                Atsakymų: {question.stats.totalResponses}
              </div>

              {renderChart(question)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

