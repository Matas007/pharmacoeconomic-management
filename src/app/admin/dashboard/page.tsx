'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Chat from '@/components/Chat'
import { Users, FileText, Clock, CheckCircle, XCircle, LogOut, Eye } from 'lucide-react'

interface Request {
  id: string
  title: string
  description: string
  status: string
  priority: string
  createdAt: string
  user: {
    name: string
    email: string
  }
}

interface KanbanColumn {
  id: string
  title: string
  requests: Request[]
  color: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/user/dashboard')
    } else if (status === 'authenticated') {
      fetchRequests()
    }
  }, [status, session, router])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/requests')
      if (response.ok) {
        const data = await response.json()
        organizeRequestsIntoColumns(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Klaida gaunant užklausas:', error)
    } finally {
      setLoading(false)
    }
  }

  const organizeRequestsIntoColumns = (requests: Request[]) => {
    const pendingRequests = requests.filter(r => r.status === 'PENDING')
    const inProgressRequests = requests.filter(r => r.status === 'IN_PROGRESS')
    const completedRequests = requests.filter(r => r.status === 'COMPLETED')
    const rejectedRequests = requests.filter(r => r.status === 'REJECTED')

    setColumns([
      {
        id: 'PENDING',
        title: 'Laukiantys',
        requests: pendingRequests,
        color: 'bg-yellow-50 border-yellow-200'
      },
      {
        id: 'IN_PROGRESS',
        title: 'Vykdomi',
        requests: inProgressRequests,
        color: 'bg-blue-50 border-blue-200'
      },
      {
        id: 'COMPLETED',
        title: 'Užbaigti',
        requests: completedRequests,
        color: 'bg-green-50 border-green-200'
      },
      {
        id: 'REJECTED',
        title: 'Atmesti',
        requests: rejectedRequests,
        color: 'bg-red-50 border-red-200'
      }
    ])
  }

  const calculateStats = (requests: Request[]) => {
    setStats({
      total: requests.length,
      pending: requests.filter(r => r.status === 'PENDING').length,
      inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
      completed: requests.filter(r => r.status === 'COMPLETED').length
    })
  }

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const newStatus = destination.droppableId
    const requestId = draggableId

    try {
      const response = await fetch('/api/admin/requests/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status: newStatus
        }),
      })

      if (response.ok) {
        // Atnaujinti vietinę būseną
        setColumns(prevColumns => {
          const newColumns = [...prevColumns]
          const sourceColumn = newColumns.find(col => col.id === source.droppableId)
          const destColumn = newColumns.find(col => col.id === destination.droppableId)
          
          if (sourceColumn && destColumn) {
            const request = sourceColumn.requests.find(req => req.id === requestId)
            if (request) {
              request.status = newStatus
              sourceColumn.requests = sourceColumn.requests.filter(req => req.id !== requestId)
              destColumn.requests.push(request)
            }
          }
          return newColumns
        })
      }
    } catch (error) {
      console.error('Klaida atnaujinant statusą:', error)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'IN_PROGRESS':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  if (status === 'loading' || loading || !mounted) {
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Administratoriaus panelė
              </h1>
              <p className="text-gray-600">Valdykite užklausas ir projektus</p>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Atsijungti</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Iš viso užklausų</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Laukiantys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vykdomi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Užbaigti</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Užklausų valdymas</h2>
            <p className="text-gray-600">Vilkite korteles tarp stulpelių, kad keistumėte statusą</p>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((column) => (
                  <div key={column.id} className="space-y-4">
                    <div className={`p-4 rounded-lg border-2 ${column.color}`}>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {column.title} ({column.requests.length})
                      </h3>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[200px] p-2 rounded-lg ${
                            snapshot.isDraggingOver ? 'bg-gray-100' : 'bg-gray-50'
                          }`}
                        >
                          {column.requests.map((request, index) => (
                            <Draggable
                              key={request.id}
                              draggableId={request.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white rounded-lg shadow-sm border p-4 mb-3 cursor-move hover:shadow-md transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 text-sm">
                                      {request.title}
                                    </h4>
                                    <div className="flex items-center space-x-1">
                                      {getStatusIcon(request.status)}
                                    </div>
                                  </div>

                                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                                    {request.description}
                                  </p>

                                  <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                      {request.priority}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(request.createdAt).toLocaleDateString('lt-LT')}
                                    </span>
                                  </div>

                                  <div className="mt-2 pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Users className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-600">
                                          {request.user.name}
                                        </span>
                                      </div>
                                      <Link
                                        href={`/admin/request/${request.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-blue-600 hover:text-blue-700 text-xs flex items-center space-x-1"
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>Peržiūrėti</span>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>
          </DragDropContext>
        </div>
      </div>

      <Chat />
    </div>
  )
}
