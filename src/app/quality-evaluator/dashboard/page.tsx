'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, Users, Star, MessageSquare, Calendar, CheckCircle, Clock, AlertCircle, Paperclip, LineChart, ThumbsUp, ThumbsDown, ChevronDown, Menu, X as XIcon } from 'lucide-react'
import Chat from '@/components/Chat'
import SubtaskDetailsModal from '@/components/SubtaskDetailsModal'

interface Subtask {
  id: string
  title: string
  completed: boolean
  completedAt: string | null
  order: number
}

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  startDate: string
  endDate: string
  progress: number
  color: string
  createdAt: string
  subtasks: Subtask[]
  user: {
    name: string
    email: string
  }
}

interface Feedback {
  id: string
  easeOfUse: number
  speed: number
  colorPalette: number
  fontStyle: number
  fontReadability: number
  contentClarity: number
  contentAmount: number
  tone: number
  reliability: number
  communication: number
  comment: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Stats {
  total: number
  averages: {
    easeOfUse: number
    speed: number
    colorPalette: number
    fontStyle: number
    fontReadability: number
    contentClarity: number
    contentAmount: number
    tone: number
    reliability: number
    communication: number
    overall: number
  }
}

interface UserSegment {
  id: string
  name: string
  email: string
  createdAt: string
  segment: 'VIP' | 'AKTYVUS' | 'NAUJAS' | 'NEAKTYVUS'
  stats: {
    totalRequests: number
    recentRequests: number
    lastRequestDate: string | null
  }
}

interface SegmentCounts {
  VIP: number
  AKTYVUS: number
  NAUJAS: number
  NEAKTYVUS: number
  TOTAL: number
}

export default function QualityEvaluatorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<UserSegment[]>([])
  const [segmentCounts, setSegmentCounts] = useState<SegmentCounts | null>(null)
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState<'feedbacks' | 'tasks' | 'users'>('feedbacks')
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'QUALITY_EVALUATOR') {
        router.push('/')
      } else {
        fetchData()
      }
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      // Fetch feedbacks
      const feedbacksResponse = await fetch('/api/quality-evaluator/feedbacks')
      if (feedbacksResponse.ok) {
        const feedbacksData = await feedbacksResponse.json()
        setFeedbacks(feedbacksData.feedbacks)
        setStats(feedbacksData.stats)
      }

      // Fetch tasks
      const tasksResponse = await fetch('/api/quality-evaluator/tasks')
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData)
      }

      // Fetch users with segments
      await fetchUsers()
    } catch (error) {
      console.error('Klaida gaunant duomenis:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (segment: string = 'ALL') => {
    try {
      const url = segment === 'ALL' 
        ? '/api/quality-evaluator/users'
        : `/api/quality-evaluator/users?segment=${segment}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setSegmentCounts(data.counts)
      }
    } catch (error) {
      console.error('Klaida gaunant vartotojus:', error)
    }
  }

  const handleSegmentFilter = async (segment: string) => {
    setSelectedSegment(segment)
    await fetchUsers(segment === 'ALL' ? 'ALL' : segment)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    if (score >= 4) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'DONE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'AKTYVUS':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'NAUJAS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'NEAKTYVUS':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'VIP':
        return '👑'
      case 'AKTYVUS':
        return '🔥'
      case 'NAUJAS':
        return '🆕'
      case 'NEAKTYVUS':
        return '💤'
      default:
        return '👤'
    }
  }

  const metrics = [
    { key: 'easeOfUse', label: 'Paprastumas naudotis', icon: '🎯' },
    { key: 'speed', label: 'Greitis', icon: '⚡' },
    { key: 'colorPalette', label: 'Spalvų paletė', icon: '🎨' },
    { key: 'fontStyle', label: 'Šrifto stilius', icon: '✍️' },
    { key: 'fontReadability', label: 'Šrifto skaitomumas', icon: '👓' },
    { key: 'contentClarity', label: 'Turinio aiškumas', icon: '💡' },
    { key: 'contentAmount', label: 'Turinio kiekis', icon: '📚' },
    { key: 'tone', label: 'Tonas', icon: '🗣️' },
    { key: 'reliability', label: 'Patikimumas', icon: '🔒' },
    { key: 'communication', label: 'Komunikacija', icon: '💬' }
  ]

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kraunama...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto mobile-container">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                Kokybės vertintojo panelė
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 truncate">Sveiki, {session?.user?.name}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="hidden sm:flex bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition duration-200 text-sm touch-target"
            >
              Atsijungti
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mobile-container py-4 sm:py-6 lg:py-8">
        {/* Tabs Navigation - Desktop */}
        <div className="mb-4 sm:mb-6 hidden md:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('feedbacks')}
                className={`${
                  activeTab === 'feedbacks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Star className="w-5 h-5" />
                Atsiliepimai
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Calendar className="w-5 h-5" />
                IT Užduotys
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Users className="w-5 h-5" />
                Vartotojai
                {segmentCounts && (
                  <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs font-semibold">
                    {segmentCounts.TOTAL}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push('/admin/analytics')}
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2"
              >
                <LineChart className="w-5 h-5" />
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        <div className="mb-4 sm:mb-6 md:hidden">
          <div className="relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-50 touch-target"
            >
              <div className="flex items-center gap-2">
                {activeTab === 'feedbacks' && <><Star className="w-5 h-5 text-blue-600" /> Atsiliepimai</>}
                {activeTab === 'tasks' && <><Calendar className="w-5 h-5 text-blue-600" /> IT Užduotys</>}
                {activeTab === 'users' && (
                  <>
                    <Users className="w-5 h-5 text-blue-600" /> 
                    Vartotojai
                    {segmentCounts && (
                      <span className="bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs font-semibold">
                        {segmentCounts.TOTAL}
                      </span>
                    )}
                  </>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showMobileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMobileMenu(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setActiveTab('feedbacks')
                      setShowMobileMenu(false)
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium hover:bg-gray-50 touch-target ${
                      activeTab === 'feedbacks' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <Star className="w-5 h-5" />
                    Atsiliepimai
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('tasks')
                      setShowMobileMenu(false)
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium hover:bg-gray-50 touch-target border-t ${
                      activeTab === 'tasks' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    IT Užduotys
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('users')
                      setShowMobileMenu(false)
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium hover:bg-gray-50 touch-target border-t ${
                      activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    Vartotojai
                    {segmentCounts && (
                      <span className="ml-auto bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs font-semibold">
                        {segmentCounts.TOTAL}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      router.push('/admin/analytics')
                      setShowMobileMenu(false)
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium text-gray-700 hover:bg-gray-50 touch-target border-t"
                  >
                    <LineChart className="w-5 h-5" />
                    Analytics
                  </button>
                  <button
                    onClick={() => {
                      signOut()
                      setShowMobileMenu(false)
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium text-red-600 hover:bg-red-50 touch-target border-t"
                  >
                    <XIcon className="w-5 h-5" />
                    Atsijungti
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Feedbacks Tab */}
        {activeTab === 'feedbacks' && stats && (
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              Bendri rodikliai
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-600">Iš viso atsiliepimų</p>
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-600">Vidutinis įvertinimas</p>
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {stats.averages.overall.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-600">Geriausias rodiklis</p>
                    <ThumbsUp className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {(() => {
                      const metricAverages = metrics.map(m => ({
                        label: m.label,
                        avg: stats.averages[m.key as keyof typeof stats.averages]
                      }))
                      metricAverages.sort((a, b) => b.avg - a.avg)
                      return metricAverages[0].avg.toFixed(1)
                    })()}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    {(() => {
                      const metricAverages = metrics.map(m => ({
                        label: m.label,
                        avg: stats.averages[m.key as keyof typeof stats.averages]
                      }))
                      metricAverages.sort((a, b) => b.avg - a.avg)
                      return metricAverages[0].label
                    })()}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-600">Blogiausias rodiklis</p>
                    <ThumbsDown className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-red-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {(() => {
                      const metricAverages = metrics.map(m => ({
                        label: m.label,
                        avg: stats.averages[m.key as keyof typeof stats.averages]
                      }))
                      metricAverages.sort((a, b) => a.avg - b.avg)
                      return metricAverages[0].avg.toFixed(1)
                    })()}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    {(() => {
                      const metricAverages = metrics.map(m => ({
                        label: m.label,
                        avg: stats.averages[m.key as keyof typeof stats.averages]
                      }))
                      metricAverages.sort((a, b) => a.avg - b.avg)
                      return metricAverages[0].label
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Metrikos vidurkiai */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Vidutiniai įvertinimai pagal metrikas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                {metrics.map(({ key, label, icon }) => {
                  const score = stats.averages[key as keyof typeof stats.averages]
                  return (
                    <div key={key} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{icon}</div>
                      <div className={`text-xl sm:text-2xl font-bold mb-1 ${getScoreColor(score).split(' ')[0]}`}>
                        {score.toFixed(1)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-600 line-clamp-2">{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Atsiliepimai */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                Visi atsiliepimai
              </h2>

              {feedbacks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
                  <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Atsiliepimų dar nėra
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Vartotojai dar nepaliko jokių atsiliepimų apie sistemą
                  </p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {feedbacks.map((feedback) => {
                    const average = metrics.reduce((sum, { key }) => 
                      sum + (feedback[key as keyof Feedback] as number), 0
                    ) / metrics.length

                    return (
                      <div key={feedback.id} className="bg-white rounded-lg shadow">
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                {feedback.user.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{feedback.user.email}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                {new Date(feedback.createdAt).toLocaleString('lt-LT')}
                              </p>
                            </div>
                            <div className="text-center bg-gray-50 rounded-lg p-3 sm:p-0 sm:bg-transparent">
                              <div className={`text-3xl sm:text-4xl font-bold ${getScoreColor(average).split(' ')[0]}`}>
                                {average.toFixed(1)}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">Bendras</p>
                            </div>
                          </div>

                          {/* Metrikos */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-3 sm:mb-4">
                            {metrics.map(({ key, label, icon }) => {
                              const score = feedback[key as keyof Feedback] as number
                              return (
                                <div key={key} className="text-center p-2 sm:p-3 bg-gray-50 rounded">
                                  <div className="text-lg sm:text-xl mb-1">{icon}</div>
                                  <div className={`text-lg sm:text-xl font-bold ${getScoreColor(score).split(' ')[0]}`}>
                                    {score}
                                  </div>
                                  <div className="text-[9px] sm:text-xs text-gray-600 mt-1 line-clamp-2">{label}</div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Komentaras */}
                          {feedback.comment && (
                            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="font-semibold text-sm sm:text-base text-blue-900 mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Komentaras:
                              </h4>
                              <p className="text-xs sm:text-sm text-blue-800 whitespace-pre-wrap break-words">{feedback.comment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex flex-wrap items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            <span>IT Specialistų užduočių progresas</span>
            <span className="text-xs sm:text-sm font-normal text-gray-500">(tik peržiūra)</span>
          </h2>

          {tasks.length > 0 ? (
            <>
              {/* Statistika */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-gray-600">Iš viso</p>
                      <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{tasks.length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-gray-600">Laukiančios</p>
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {tasks.filter(t => t.status === 'TODO').length}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-gray-600">Vykdomos</p>
                      <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-blue-900">
                      {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-gray-600">Užbaigtos</p>
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-green-900">
                      {tasks.filter(t => t.status === 'DONE').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gantt Chart */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Gantt grafikas</h3>
                <ReadOnlyGanttChart tasks={tasks} />
              </div>

              {/* Task List */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 sm:p-6 border-b">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Užduočių sąrašas</h3>
                </div>
                <div className="divide-y">
                  {tasks.map((task) => (
                    <ReadOnlyTaskItem
                      key={task.id}
                      task={task}
                      onSelectSubtask={(subtask) => setSelectedSubtask(subtask)}
                      getStatusColor={getStatusColor}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Dar nėra užduočių
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                IT specialistai dar nesukūrė jokių užduočių
              </p>
            </div>
          )}
        </div>
        )}

        {/* Users Tab - Vartotojų segmentavimas */}
        {activeTab === 'users' && (
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            Vartotojų segmentavimas
          </h2>

          {/* Segment Filters */}
          {segmentCounts && (
            <div className="mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <button
                onClick={() => handleSegmentFilter('ALL')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all touch-target ${
                  selectedSegment === 'ALL'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-1">👥</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-600">Visi</div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">{segmentCounts.TOTAL}</div>
                </div>
              </button>

              <button
                onClick={() => handleSegmentFilter('VIP')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all touch-target ${
                  selectedSegment === 'VIP'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-1">👑</div>
                  <div className="text-xs sm:text-sm font-medium text-purple-600">VIP</div>
                  <div className="text-lg sm:text-2xl font-bold text-purple-700">{segmentCounts.VIP}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">5+ užklausų</div>
                </div>
              </button>

              <button
                onClick={() => handleSegmentFilter('AKTYVUS')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all touch-target ${
                  selectedSegment === 'AKTYVUS'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-1">🔥</div>
                  <div className="text-xs sm:text-sm font-medium text-green-600">Aktyvus</div>
                  <div className="text-lg sm:text-2xl font-bold text-green-700">{segmentCounts.AKTYVUS}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">1-4 užklausos</div>
                </div>
              </button>

              <button
                onClick={() => handleSegmentFilter('NAUJAS')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all touch-target ${
                  selectedSegment === 'NAUJAS'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-1">🆕</div>
                  <div className="text-xs sm:text-sm font-medium text-blue-600">Naujas</div>
                  <div className="text-lg sm:text-2xl font-bold text-blue-700">{segmentCounts.NAUJAS}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">≤7d, 0 užklausų</div>
                </div>
              </button>

              <button
                onClick={() => handleSegmentFilter('NEAKTYVUS')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all touch-target col-span-2 sm:col-span-1 ${
                  selectedSegment === 'NEAKTYVUS'
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-1">💤</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-600">Neaktyvus</div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-700">{segmentCounts.NEAKTYVUS}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">&gt;7d, 0 užklausų</div>
                </div>
              </button>
            </div>
          )}

          {/* Users List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vartotojas
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Segmentas
                      </th>
                      <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registracijos data
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Užklausos
                      </th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Per 30 dienų
                      </th>
                      <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paskutinė užklausa
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center">
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.name}</div>
                              <div className="text-xs text-gray-500 truncate">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getSegmentColor(user.segment)}`}>
                            <span>{getSegmentIcon(user.segment)}</span>
                            <span className="hidden sm:inline">{user.segment}</span>
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('lt-LT')}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-semibold">
                          {user.stats.totalRequests}
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {user.stats.recentRequests}
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {user.stats.lastRequestDate 
                            ? new Date(user.stats.lastRequestDate).toLocaleDateString('lt-LT')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-gray-500">Vartotojų nerasta</p>
              </div>
            )}
          </div>
        </div>
        )}
      </main>

      <Chat />

      {/* Subtask Details Modal */}
      {selectedSubtask && (
        <SubtaskDetailsModal
          subtask={selectedSubtask}
          onClose={() => {
            setSelectedSubtask(null)
            fetchData() // Refresh data to update any changes
          }}
          isQualityEvaluator={true}
        />
      )}
    </div>
  )
}

// Read-only Gantt Chart Component
function ReadOnlyGanttChart({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null

  // Rasti ankščiausią ir vėliausią datas
  const allDates = tasks.flatMap(t => [new Date(t.startDate), new Date(t.endDate)])
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
  
  // Pridėti margin
  minDate.setDate(minDate.getDate() - 2)
  maxDate.setDate(maxDate.getDate() + 2)
  
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
  
  const getPosition = (date: Date) => {
    const diff = date.getTime() - minDate.getTime()
    const days = diff / (1000 * 60 * 60 * 24)
    return (days / totalDays) * 100
  }
  
  const getDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime()
    const days = diff / (1000 * 60 * 60 * 24)
    return (days / totalDays) * 100
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Timeline header */}
        <div className="flex items-center mb-2 pl-64">
          <div className="flex-1 flex border-b border-gray-200 pb-2">
            {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, i) => {
              const date = new Date(minDate)
              date.setDate(date.getDate() + i * 7)
              return (
                <div key={i} className="flex-1 text-center text-sm text-gray-600">
                  {date.toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Tasks */}
        {tasks.map((task) => {
          const start = new Date(task.startDate)
          const end = new Date(task.endDate)
          const left = getPosition(start)
          const width = getDuration(start, end)
          
          return (
            <div key={task.id} className="flex items-center mb-2">
              <div className="w-64 pr-4 flex flex-col">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {task.title}
                </span>
                <span className="text-xs text-gray-500">
                  {task.user.name}
                </span>
              </div>
              <div className="flex-1 relative h-10">
                <div
                  className="absolute h-8 rounded flex items-center px-3 text-white text-sm font-medium shadow-sm cursor-default"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: task.color
                  }}
                  title={`${task.title} - ${task.progress}% užbaigta\n${task.user.name}`}
                >
                  <span className="truncate">{task.title}</span>
                  <span className="ml-auto text-xs opacity-75">{task.progress}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Read-only Task Item Component
function ReadOnlyTaskItem({ 
  task, 
  onSelectSubtask,
  getStatusColor, 
  getPriorityColor 
}: { 
  task: Task
  onSelectSubtask: (subtask: Subtask) => void
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
}) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{task.title}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <span>
              📅 {new Date(task.startDate).toLocaleDateString('lt-LT')} - {new Date(task.endDate).toLocaleDateString('lt-LT')}
            </span>
            <span>Progress: {task.progress}%</span>
            <span className="text-purple-600">IT: {task.user.name}</span>
          </div>
          
          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Mini dalys ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}):
              </p>
              {task.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-2 text-sm">
                  <span className={subtask.completed ? 'text-green-600' : 'text-gray-400'}>
                    {subtask.completed ? '✓' : '○'}
                  </span>
                  <div className="flex-1 flex items-center justify-between">
                    <span className={subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                      {subtask.title}
                    </span>
                    {subtask.completed && subtask.completedAt && (
                      <span className="text-xs text-green-600 ml-2">
                        ✓ {new Date(subtask.completedAt).toLocaleDateString('lt-LT', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectSubtask(subtask)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Peržiūrėti failus ir pridėti pastabas"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${task.progress}%`,
                backgroundColor: task.color
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

