'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, BarChart3, CheckCircle, Clock, Trash2, Edit, X, Paperclip, FileText, Menu, LogOut } from 'lucide-react'
import Link from 'next/link'
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
}

export default function ITSpecialistDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'IT_SPECIALIST') {
        router.push('/')
      } else {
        fetchTasks()
      }
    }
  }, [status, session, router])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/it-specialist/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Klaida gaunant užduotis:', error)
    } finally {
      setLoading(false)
    }
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
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-600" />
                <span className="truncate">IT Specialisto panelė</span>
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 truncate">Sveiki, {session?.user?.name}</p>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/it-specialist/surveys"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 touch-target"
              >
                <FileText className="w-4 h-4" />
                Anketos
              </Link>
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 touch-target"
              >
                <Plus className="w-4 h-4" />
                Nauja užduotis
              </button>
              <button
                onClick={() => signOut()}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors touch-target"
              >
                Atsijungti
              </button>
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden transform transition-transform">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Menu</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg touch-target"
                aria-label="Uždaryti meniu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <Link
                href="/it-specialist/surveys"
                onClick={() => setShowMobileMenu(false)}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3 text-sm font-medium touch-target"
              >
                <FileText className="w-5 h-5" />
                Anketos
              </Link>
              <button
                onClick={() => {
                  setShowNewTaskForm(true)
                  setShowMobileMenu(false)
                }}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-3 text-sm font-medium touch-target"
              >
                <Plus className="w-5 h-5" />
                Nauja užduotis
              </button>
              <button
                onClick={() => {
                  signOut()
                  setShowMobileMenu(false)
                }}
                className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-3 text-sm font-medium touch-target"
              >
                <LogOut className="w-5 h-5" />
                Atsijungti
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mobile-container py-4 sm:py-6 lg:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Iš viso</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 self-start sm:self-auto" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Laukiančios</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'TODO').length}
                </p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 self-start sm:self-auto" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Vykdomos</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">
                  {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 self-start sm:self-auto" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Užbaigtos</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900">
                  {tasks.filter(t => t.status === 'DONE').length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 self-start sm:self-auto" />
            </div>
          </div>
        </div>

        {/* Mobile FAB for New Task */}
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="lg:hidden fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 z-30 touch-target"
          title="Nauja užduotis"
          aria-label="Nauja užduotis"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Gantt Chart */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            Gantt grafikas
          </h2>
          
          {tasks.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Dar nėra užduočių</p>
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 text-sm sm:text-base touch-target"
              >
                <Plus className="w-4 h-4" />
                Sukurti pirmą užduotį
              </button>
            </div>
          ) : (
            <GanttChart tasks={tasks} onTaskClick={setEditingTask} />
          )}
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Užduočių sąrašas</h2>
          </div>
          <div className="divide-y">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={() => setEditingTask(task)}
                onSelectSubtask={(subtask) => setSelectedSubtask(subtask)}
                onDelete={async () => {
                  if (confirm('Ar tikrai norite ištrinti šią užduotį?')) {
                    try {
                      const res = await fetch(`/api/it-specialist/tasks/${task.id}`, {
                        method: 'DELETE'
                      })
                      if (res.ok) {
                        fetchTasks()
                      }
                    } catch (error) {
                      console.error('Klaida trinant užduotį:', error)
                    }
                  }
                }}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        </div>
      </main>

      {/* New/Edit Task Modal */}
      {(showNewTaskForm || editingTask) && (
        <TaskFormModal
          task={editingTask}
          onClose={() => {
            setShowNewTaskForm(false)
            setEditingTask(null)
          }}
          onSuccess={() => {
            fetchTasks()
            setShowNewTaskForm(false)
            setEditingTask(null)
          }}
        />
      )}

      <Chat />

      {/* Subtask Details Modal */}
      {selectedSubtask && (
        <SubtaskDetailsModal
          subtask={selectedSubtask}
          onClose={() => {
            setSelectedSubtask(null)
            fetchTasks() // Refresh tasks to update any changes
          }}
          isQualityEvaluator={false}
        />
      )}
    </div>
  )
}

// Gantt Chart Component
function GanttChart({ tasks, onTaskClick }: { tasks: Task[], onTaskClick: (task: Task) => void }) {
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
        <div className="flex items-center mb-2 pl-48">
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
            <div key={task.id} className="flex items-center mb-2 group">
              <div className="w-48 pr-4 text-sm font-medium text-gray-700 truncate">
                {task.title}
              </div>
              <div className="flex-1 relative h-10">
                <button
                  onClick={() => onTaskClick(task)}
                  className="absolute h-8 rounded hover:opacity-80 transition-opacity flex items-center px-3 text-white text-sm font-medium shadow-sm"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: task.color
                  }}
                >
                  <span className="truncate">{task.title}</span>
                  <span className="ml-auto text-xs opacity-75">{task.progress}%</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Task Item Component
function TaskItem({ 
  task, 
  onEdit, 
  onDelete, 
  onSelectSubtask,
  getStatusColor, 
  getPriorityColor 
}: { 
  task: Task
  onEdit: () => void
  onDelete: () => void
  onSelectSubtask: (subtask: Subtask) => void
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
}) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
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
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectSubtask(subtask)
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Pridėti failus ir pastabas"
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
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Redaguoti"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Ištrinti"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Task Form Modal Component
function TaskFormModal({ 
  task, 
  onClose, 
  onSuccess 
}: { 
  task: Task | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    startDate: task?.startDate ? task.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: task?.endDate ? task.endDate.split('T')[0] : new Date().toISOString().split('T')[0],
    color: task?.color || '#2c3e50'
  })
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || [])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = task 
        ? `/api/it-specialist/tasks/${task.id}`
        : '/api/it-specialist/tasks'
      
      const method = task ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        alert(data.error || 'Klaida išsaugant užduotį')
      }
    } catch (error) {
      console.error('Klaida išsaugant užduotį:', error)
      alert('Klaida išsaugant užduotį')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {task ? 'Redaguoti užduotį' : 'Nauja užduotis'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
              Pavadinimas *
            </label>
            <input
              id="task-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-2">
              Aprašymas
            </label>
            <textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-2">
                Statusas
              </label>
              <select
                id="task-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-2">
                Prioritetas
              </label>
              <select
                id="task-priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-start-date" className="block text-sm font-medium text-gray-700 mb-2">
                Pradžios data *
              </label>
              <input
                id="task-start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="task-end-date" className="block text-sm font-medium text-gray-700 mb-2">
                Pabaigos data *
              </label>
              <input
                id="task-end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="task-color" className="block text-sm font-medium text-gray-700 mb-2">
              Spalva
            </label>
            <input
              id="task-color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Subtasks Section */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mini dalys (subtasks)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Progress skaičiuojamas automatiškai pagal užbaigtų mini dalių skaičių
            </p>

            {/* Existing subtasks */}
            {task && subtasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      id={`subtask-${subtask.id}`}
                      checked={subtask.completed}
                      onChange={async () => {
                        try {
                          const res = await fetch(`/api/it-specialist/subtasks/${subtask.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ completed: !subtask.completed })
                          })
                          if (res.ok) {
                            const updated = await res.json()
                            setSubtasks(subtasks.map(st => st.id === subtask.id ? updated : st))
                          }
                        } catch (error) {
                          console.error('Klaida atnaujinant subtask:', error)
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                      aria-label={`Pažymėti "${subtask.title}" kaip ${subtask.completed ? 'neužbaigtą' : 'užbaigtą'}`}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
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
                      type="button"
                      onClick={async () => {
                        if (confirm('Ištrinti šią mini dalį?')) {
                          try {
                            const res = await fetch(`/api/it-specialist/subtasks/${subtask.id}`, {
                              method: 'DELETE'
                            })
                            if (res.ok) {
                              setSubtasks(subtasks.filter(st => st.id !== subtask.id))
                            }
                          } catch (error) {
                            console.error('Klaida trinant subtask:', error)
                          }
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      aria-label="Ištrinti mini dalį"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new subtask */}
            {task && (
              <div className="flex gap-2">
                <input
                  id="new-subtask-input"
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Nauja mini dalis..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={async (e) => {
                    if (e.key === 'Enter' && newSubtaskTitle.trim()) {
                      e.preventDefault()
                      try {
                        const res = await fetch(`/api/it-specialist/tasks/${task.id}/subtasks`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ title: newSubtaskTitle.trim() })
                        })
                        if (res.ok) {
                          const newSubtask = await res.json()
                          setSubtasks([...subtasks, newSubtask])
                          setNewSubtaskTitle('')
                        }
                      } catch (error) {
                        console.error('Klaida kuriant subtask:', error)
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newSubtaskTitle.trim()) return
                    try {
                      const res = await fetch(`/api/it-specialist/tasks/${task.id}/subtasks`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: newSubtaskTitle.trim() })
                      })
                      if (res.ok) {
                        const newSubtask = await res.json()
                        setSubtasks([...subtasks, newSubtask])
                        setNewSubtaskTitle('')
                      }
                    } catch (error) {
                      console.error('Klaida kuriant subtask:', error)
                    }
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  aria-label="Pridėti mini dalį"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
            {!task && (
              <p className="text-sm text-gray-500 italic">
                Mini dalis galėsite pridėti po užduoties sukūrimo
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Atšaukti
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saugoma...' : task ? 'Atnaujinti' : 'Sukurti'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

