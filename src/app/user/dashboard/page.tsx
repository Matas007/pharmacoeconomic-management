'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Clock, CheckCircle, XCircle, ClipboardList, Bell } from 'lucide-react'
import FeedbackPrompt from '@/components/FeedbackPrompt'
import Chat from '@/components/Chat'

interface Request {
  id: string
  title: string
  description: string
  status: string
  priority: string
  createdAt: string
  adminNotes?: string | null
}

interface Survey {
  id: string
  title: string
  description: string
  createdAt: string
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchRequests()
      fetchSurveys()
    }
  }, [status, router])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/user/requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error('Klaida gaunant užklausas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/surveys')
      if (response.ok) {
        const data = await response.json()
        setSurveys(data)
      }
    } catch (error) {
      console.error('Klaida gaunant anketas:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'IN_PROGRESS':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Laukiantis'
      case 'IN_PROGRESS':
        return 'Vykdomas'
      case 'COMPLETED':
        return 'Užbaigtas'
      case 'REJECTED':
        return 'Atmestas'
      default:
        return status
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4 gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Vartotojo panelė
              </h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">Sveiki, {session?.user?.name}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/user/new-request"
                className="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base touch-target"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Nauja užklausa</span>
                <span className="xs:hidden">Nauja</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition duration-200 text-sm sm:text-base touch-target"
              >
                <span className="hidden sm:inline">Atsijungti</span>
                <span className="sm:hidden">✕</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mobile-container py-4 sm:py-6 lg:py-8">
        {/* Survey Alert */}
        {surveys.length > 0 && (
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4 sm:p-6 shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 animate-bounce" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                      {surveys.length}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    Naujų anketų pranešimas!
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                    {surveys.length === 1 
                      ? 'Turite 1 naują anketą, kurią galite užpildyti.' 
                      : `Turite ${surveys.length} naujas anketas, kurias galite užpildyti.`}
                  </p>
                  <div className="space-y-2 sm:space-y-3">
                    {surveys.slice(0, 3).map(survey => (
                      <div key={survey.id} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{survey.title}</h4>
                            {survey.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{survey.description}</p>
                            )}
                          </div>
                          <Link
                            href={`/user/surveys/${survey.id}`}
                            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-sm touch-target"
                          >
                            <ClipboardList className="w-4 h-4" />
                            Atsakyti
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  {surveys.length > 3 && (
                    <Link
                      href="/user/surveys"
                      className="mt-3 sm:mt-4 inline-flex items-center gap-2 text-sm sm:text-base text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium"
                    >
                      Žiūrėti visas anketas ({surveys.length})
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Mano užklausos</h2>
          
          {requests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Užklausų nėra
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Sukurkite pirmą užklausą farmakoekonominio modeliavimo paslaugai
              </p>
              <Link
                href="/user/new-request"
                className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition duration-200 inline-flex items-center justify-center space-x-2 text-sm sm:text-base touch-target"
              >
                <Plus className="w-4 h-4" />
                <span>Sukurti užklausą</span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        {request.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">{request.description}</p>
                      
                      {request.adminNotes && (
                        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-sm sm:text-base text-blue-900 mb-2">Administratoriaus pastabos:</h4>
                          <p className="text-xs sm:text-sm text-blue-800 whitespace-pre-wrap break-words">{request.adminNotes}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <span>
                          Sukurta: {new Date(request.createdAt).toLocaleDateString('lt-LT')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:ml-4 justify-end sm:justify-start">
                      {getStatusIcon(request.status)}
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Feedback pranešimas */}
      <FeedbackPrompt />
      <Chat />
    </div>
  )
}
