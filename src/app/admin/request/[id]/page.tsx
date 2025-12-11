'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User, Calendar, RefreshCw } from 'lucide-react'

interface Request {
  id: string
  title: string
  description: string
  status: string
  priority: string
  filters: string | null
  adminNotes: string | null
  createdAt: string
  user: {
    name: string
    email: string
  }
}

export default function RequestView() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState('')
  const [currentStatus, setCurrentStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [success, setSuccess] = useState(false)
  const [statusSuccess, setStatusSuccess] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/user/dashboard')
    } else if (status === 'authenticated') {
      fetchRequest()
    }
  }, [status, session, router])

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/admin/requests/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setRequest(data)
        setAdminNotes(data.adminNotes || '')
        setCurrentStatus(data.status)
      }
    } catch (error) {
      console.error('Klaida gaunant užklausą:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setSavingStatus(true)
    setStatusSuccess(false)

    try {
      const response = await fetch('/api/admin/requests/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: params.id,
          status: newStatus
        }),
      })

      if (response.ok) {
        setCurrentStatus(newStatus)
        setRequest(prev => prev ? {...prev, status: newStatus} : null)
        setStatusSuccess(true)
        setTimeout(() => setStatusSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Klaida keičiant statusą:', error)
    } finally {
      setSavingStatus(false)
    }
  }

  const handleSaveNotes = async () => {
    setSaving(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/requests/notes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: params.id,
          adminNotes
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Klaida išsaugant pastabas:', error)
    } finally {
      setSaving(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Užklausa nerasta</h2>
          <Link
            href="/admin/dashboard"
            className="text-blue-600 hover:text-blue-700"
          >
            Grįžti į dashboard
          </Link>
        </div>
      </div>
    )
  }

  let parsedFilters = null
  try {
    parsedFilters = request.filters ? JSON.parse(request.filters) : null
  } catch (e) {
    console.error('Klaida parsinti filtrus:', e)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atgal į dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Užklausos peržiūra
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pagrindinė informacija */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {request.title}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aprašymas:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
              </div>
            </div>

            {/* Filtrai */}
            {parsedFilters && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Farmakoekonominio modeliavimo parametrai
                </h3>

                <div className="space-y-4">
                  {parsedFilters.population && parsedFilters.population.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Tikslinė populiacija:</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedFilters.population.map((item: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedFilters.intervention && parsedFilters.intervention.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Intervencija:</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedFilters.intervention.map((item: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedFilters.comparator && parsedFilters.comparator.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Palyginimas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedFilters.comparator.map((item: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedFilters.outcome && parsedFilters.outcome.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Rezultatai:</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedFilters.outcome.map((item: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedFilters.timeHorizon && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Laiko horizontas:</h4>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {parsedFilters.timeHorizon}
                      </span>
                    </div>
                  )}

                  {parsedFilters.perspective && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Perspektyva:</h4>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {parsedFilters.perspective}
                      </span>
                    </div>
                  )}

                  {parsedFilters.discountRate && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Diskonto norma:</h4>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {parsedFilters.discountRate}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin pastabos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Administratoriaus pastabos
              </h3>

              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Įveskite pastabas vartotojui..."
              />

              {success && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  ✓ Pastabos sėkmingai išsaugotos!
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition duration-200 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saugoma...' : 'Išsaugoti pastabas'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Šoninė juosta */}
          <div className="lg:col-span-1 space-y-6">
            {/* Vartotojo informacija */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Vartotojas
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Vardas:</span> {request.user.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">El. paštas:</span> {request.user.email}
                </p>
              </div>
            </div>

            {/* Statuso keitimas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RefreshCw className="w-5 h-5 mr-2" />
                Statusas
              </h3>
              <div className="space-y-4">
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={savingStatus}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Laukiantis</option>
                  <option value="IN_PROGRESS">Vykdomas</option>
                  <option value="COMPLETED">Užbaigtas</option>
                  <option value="REJECTED">Atmestas</option>
                </select>

                {statusSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                    ✓ Statusas atnaujintas!
                  </div>
                )}
              </div>
            </div>

            {/* Data informacija */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Data
              </h3>
              <p className="text-gray-700">
                <span className="font-medium">Sukurta:</span><br />
                {new Date(request.createdAt).toLocaleString('lt-LT')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
