'use client'

import { useState, useEffect } from 'react'
import { X, Paperclip } from 'lucide-react'
import FileUpload from './FileUpload'

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedBy: string
  createdAt: string
}

interface SubtaskDetailsModalProps {
  subtask: Subtask
  onClose: () => void
  isQualityEvaluator?: boolean
}

export default function SubtaskDetailsModal({
  subtask,
  onClose,
  isQualityEvaluator = false
}: SubtaskDetailsModalProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [subtask.id])

  const fetchData = async () => {
    try {
      // Fetch attachments
      const attachRes = await fetch(`/api/attachments?subtaskId=${subtask.id}`)
      if (attachRes.ok) {
        const attachData = await attachRes.json()
        setAttachments(attachData)
      }
    } catch (error) {
      console.error('Klaida gaunant duomenis:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            <h2 className="text-lg font-bold">Mini dalies detalės</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded transition-colors"
            title="Uždaryti"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Kraunama...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Subtask info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{subtask.title}</h3>
                <p className="text-sm text-gray-600">
                  Statusas: {subtask.completed ? (
                    <span className="text-green-600 font-medium">✓ Užbaigta</span>
                  ) : (
                    <span className="text-gray-500">○ Neužbaigta</span>
                  )}
                </p>
              </div>

              {/* File Upload and Comments */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">📎 Prisegti failai ir komentarai</h4>
                <p className="text-xs text-gray-600 mb-3">
                  {isQualityEvaluator 
                    ? 'Galite peržiūrėti failus ir komentuoti juos. Spustelėkite 💬 prie failo.' 
                    : 'Galite įkelti failus ir komentuoti juos. Spustelėkite 💬 prie failo.'}
                </p>
                <FileUpload
                  subtaskId={subtask.id}
                  attachments={attachments}
                  onUploadSuccess={fetchData}
                  canDelete={!isQualityEvaluator}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  )
}

