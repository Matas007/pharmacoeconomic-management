'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle, Timer, TrendingUp, Users, FileText, MessageSquare, ThumbsUp, ThumbsDown, Star } from 'lucide-react'

interface AnalyticsData {
  requestMetrics: {
    totalAbandoned: number
    avgRequestDuration: number
    completedCount: number
    conversionRate: number
    userStats: {
      id: string
      name: string
      email: string
      avgDuration: number
      requestCount: number
    }[]
    recentAbandoned: {
      id: string
      startedAt: string
      user: {
        id: string
        name: string
        email: string
      }
    }[]
  }
  feedbackMetrics: {
    totalAbandoned: number
    avgFeedbackDuration: number
    completedCount: number
    conversionRate: number
    recentAbandoned: {
      id: string
      startedAt: string
      user: {
        id: string
        name: string
        email: string
      }
    }[]
    ratings: {
      bestMetric: {
        key: string
        label: string
        average: number
      } | null
      worstMetric: {
        key: string
        label: string
        average: number
      } | null
      overallAverage: number
      totalFeedbacks: number
    }
  }
  activeUsersCount: number
  period: number
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(7)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'QUALITY_EVALUATOR') {
        router.push('/')
      } else {
        fetchAnalytics()
      }
    }
  }, [status, session, router, period])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics/stats?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Klaida gaunant analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kraunama...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Analitikos Skydelis</h1>
                <p className="text-sm text-gray-600">Vartotojų elgsenos analizė</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Paskutinės 7 dienos</option>
                <option value="14">Paskutinės 14 dienų</option>
                <option value="30">Paskutinės 30 dienų</option>
              </select>
              <button
                onClick={() => router.push('/quality-evaluator/dashboard')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Grįžti
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Užklausų metrikos */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Užklausų statistika
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Konversijos Rodiklis</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.requestMetrics.conversionRate}%
                  </p>
                  <p className="text-xs text-gray-500">
                    užbaigimo rodiklis
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Užbaigta</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.requestMetrics.completedCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    sėkmingai
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nebaigta</p>
                  <p className="text-2xl font-bold text-red-600">
                    {analytics.requestMetrics.totalAbandoned}
                  </p>
                  <p className="text-xs text-gray-500">
                    nepabaigtų
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vidutinė trukmė</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatDuration(analytics.requestMetrics.avgRequestDuration)}
                  </p>
                  <p className="text-xs text-gray-500">
                    pildyti užklausą
                  </p>
                </div>
                <Timer className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Atsiliepimų metrikos */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-orange-600" />
            Atsiliepimų statistika
          </h2>
          
          {/* Pirma eilutė - pagrindinės metrikos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Konversijos Rodiklis</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.feedbackMetrics.conversionRate}%
                  </p>
                  <p className="text-xs text-gray-500">
                    užbaigimo rodiklis
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Užbaigta</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.feedbackMetrics.completedCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    sėkmingai
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nebaigta</p>
                  <p className="text-2xl font-bold text-red-600">
                    {analytics.feedbackMetrics.totalAbandoned}
                  </p>
                  <p className="text-xs text-gray-500">
                    nepabaigtų
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vidutinė trukmė</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatDuration(analytics.feedbackMetrics.avgFeedbackDuration)}
                  </p>
                  <p className="text-xs text-gray-500">
                    pildyti atsiliepimą
                  </p>
                </div>
                <Timer className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Antra eilutė - reitingų analizė */}
          {analytics.feedbackMetrics.ratings.totalFeedbacks > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <ThumbsUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-700">
                    {analytics.feedbackMetrics.ratings.bestMetric?.average}/10
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Geriausias rodiklis
                  </p>
                  <p className="text-lg font-bold text-green-900">
                    {analytics.feedbackMetrics.ratings.bestMetric?.label}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    🎉 Aukščiausias įvertinimas
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-700">
                    {analytics.feedbackMetrics.ratings.overallAverage}/10
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Vidutinis įvertinimas
                  </p>
                  <p className="text-lg font-bold text-blue-900">
                    Visų rodiklių vidurkis
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    📊 Bendras kokybės rodiklis
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-6 border-2 border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <ThumbsDown className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-red-700">
                    {analytics.feedbackMetrics.ratings.worstMetric?.average}/10
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">
                    Blogiausias rodiklis
                  </p>
                  <p className="text-lg font-bold text-red-900">
                    {analytics.feedbackMetrics.ratings.worstMetric?.label}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Reikia tobulinti
                  </p>
                </div>
              </div>
            </div>
          )}

          {analytics.feedbackMetrics.ratings.totalFeedbacks === 0 && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Dar nėra atsiliepimų su įvertinimais</p>
            </div>
          )}
        </div>

        {/* Bendros metrikos */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktyvūs vartotojai</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {analytics.activeUsersCount}
                  </p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Detalios lentelės */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Request Completion Times */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Užklausų pildymo laikas (pagal vartotojus)</h2>
            <div className="space-y-3">
              {analytics.requestMetrics.userStats.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Nėra duomenų</p>
              ) : (
                analytics.requestMetrics.userStats.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.requestCount} užklausos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                        {formatDuration(user.avgDuration)}
                      </p>
                      <p className="text-xs text-gray-500">vidutiniškai</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Abandoned Requests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Paskutinės Nebaigtos (užklausos)</h2>
            <div className="space-y-3">
              {analytics.requestMetrics.recentAbandoned.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Nėra nebaigtų užklausų 🎉</p>
              ) : (
                analytics.requestMetrics.recentAbandoned.map((draft) => (
                  <div key={draft.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{draft.user.name}</p>
                      <p className="text-xs text-gray-500">{draft.user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {new Date(draft.startedAt).toLocaleDateString('lt-LT', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-red-600 font-medium">Nebaigė</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Abandoned Feedback */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Paskutiniai Nebaigti (atsiliepimai)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.feedbackMetrics.recentAbandoned.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Nėra nebaigtų atsiliepimų 🎉</p>
              ) : (
                analytics.feedbackMetrics.recentAbandoned.map((draft) => (
                  <div key={draft.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{draft.user.name}</p>
                      <p className="text-xs text-gray-500">{draft.user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {new Date(draft.startedAt).toLocaleDateString('lt-LT', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-orange-600 font-medium">Nebaigė</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
