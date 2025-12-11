'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Image as ImageIcon, File, X, Download, Trash2, MessageSquare, Send } from 'lucide-react'

interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedBy: string
  createdAt: string
}

interface AttachmentComment {
  id: string
  comment: string
  authorRole: string
  authorName: string
  createdAt: string
  updatedAt: string
}

interface FileUploadProps {
  subtaskId: string
  attachments: Attachment[]
  onUploadSuccess: () => void
  canDelete?: boolean
}

export default function FileUpload({
  subtaskId,
  attachments,
  onUploadSuccess,
  canDelete = false
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, AttachmentComment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({})

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Tikrinti failo dydį (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Failas per didelis. Maksimalus dydis: 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Konvertuoti failą į base64
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const base64 = reader.result as string

          const res = await fetch('/api/attachments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subtaskId,
              fileName: file.name,
              fileUrl: base64,
              fileSize: file.size,
              fileType: file.type || 'application/octet-stream'
            })
          })

          if (res.ok) {
            onUploadSuccess()
            e.target.value = '' // Reset input
          } else {
            const data = await res.json()
            setError(data.error || 'Klaida įkeliant failą')
          }
        } catch (err) {
          setError('Klaida įkeliant failą')
        } finally {
          setUploading(false)
        }
      }

      reader.onerror = () => {
        setError('Klaida skaitant failą')
        setUploading(false)
      }

      reader.readAsDataURL(file)
    } catch (err) {
      setError('Klaida įkeliant failą')
      setUploading(false)
    }
  }

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį failą?')) return

    try {
      const res = await fetch(`/api/attachments?id=${attachmentId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        onUploadSuccess()
      } else {
        const data = await res.json()
        alert(data.error || 'Klaida trinant failą')
      }
    } catch (err) {
      alert('Klaida trinant failą')
    }
  }

  const handleDownload = (attachment: Attachment) => {
    // Sukurti download link iš base64
    const link = document.createElement('a')
    link.href = attachment.fileUrl
    link.download = attachment.fileName
    link.click()
  }

  const fetchComments = async (attachmentId: string) => {
    if (loadingComments[attachmentId]) return
    
    setLoadingComments(prev => ({ ...prev, [attachmentId]: true }))
    try {
      const res = await fetch(`/api/attachment-comments?attachmentId=${attachmentId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(prev => ({ ...prev, [attachmentId]: data }))
      }
    } catch (error) {
      console.error('Klaida gaunant komentarus:', error)
    } finally {
      setLoadingComments(prev => ({ ...prev, [attachmentId]: false }))
    }
  }

  const handleAddComment = async (attachmentId: string) => {
    const comment = newComment[attachmentId]?.trim()
    if (!comment) return

    try {
      const res = await fetch('/api/attachment-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentId, comment })
      })

      if (res.ok) {
        setNewComment(prev => ({ ...prev, [attachmentId]: '' }))
        fetchComments(attachmentId)
      } else {
        const data = await res.json()
        alert(data.error || 'Klaida pridedant komentarą')
      }
    } catch (error) {
      alert('Klaida pridedant komentarą')
    }
  }

  const handleDeleteComment = async (commentId: string, attachmentId: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį komentarą?')) return

    try {
      const res = await fetch(`/api/attachment-comments?id=${commentId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchComments(attachmentId)
      } else {
        const data = await res.json()
        alert(data.error || 'Klaida trinant komentarą')
      }
    } catch (error) {
      alert('Klaida trinant komentarą')
    }
  }

  const toggleComments = (attachmentId: string) => {
    if (selectedAttachment === attachmentId) {
      setSelectedAttachment(null)
    } else {
      setSelectedAttachment(attachmentId)
      if (!comments[attachmentId]) {
        fetchComments(attachmentId)
      }
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />
    } else if (fileType === 'application/pdf' || fileType.includes('document')) {
      return <FileText className="w-4 h-4" />
    } else {
      return <File className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'IT_SPECIALIST':
        return 'bg-purple-100 text-purple-700'
      case 'QUALITY_EVALUATOR':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'IT_SPECIALIST':
        return 'IT'
      case 'QUALITY_EVALUATOR':
        return 'Kokybė'
      default:
        return role
    }
  }

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <label className="block">
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.xlsx,.xls"
          />
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {uploading ? 'Įkeliama...' : 'Spustelėkite arba vilkite failą čia'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, Word, Excel, nuotraukos (max 5MB)
            </p>
          </div>
        </label>

        {error && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">
            Prisegti failai ({attachments.length}):
          </p>
          {attachments.map((attachment) => (
            <div key={attachment.id} className="border border-gray-200 rounded-lg">
              {/* File Header */}
              <div className="flex items-center gap-2 p-2 bg-gray-50">
                <div className="flex-shrink-0 text-gray-500">
                  {getFileIcon(attachment.fileType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(attachment.fileSize)}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getRoleBadgeColor(attachment.uploadedBy)}`}>
                      {getRoleLabel(attachment.uploadedBy)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleComments(attachment.id)}
                    className={`p-1.5 rounded transition-colors relative ${
                      selectedAttachment === attachment.id 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Komentarai"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {comments[attachment.id] && comments[attachment.id].length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {comments[attachment.id].length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Atsisiųsti"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Ištrinti"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              {selectedAttachment === attachment.id && (
                <div className="border-t border-gray-200 p-3 bg-white">
                  {/* Comments List */}
                  {loadingComments[attachment.id] ? (
                    <div className="text-center py-2">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  ) : comments[attachment.id] && comments[attachment.id].length > 0 ? (
                    <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                      {comments[attachment.id].map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded p-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${getRoleBadgeColor(comment.authorRole)}`}>
                                  {getRoleLabel(comment.authorRole)}
                                </span>
                                <span className="text-xs font-medium text-gray-700">
                                  {comment.authorName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleString('lt-LT')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-800">{comment.comment}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(comment.id, attachment.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                              title="Ištrinti"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic mb-3">Nėra komentarų</p>
                  )}

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment[attachment.id] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [attachment.id]: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(attachment.id)
                        }
                      }}
                      placeholder="Parašykite komentarą..."
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleAddComment(attachment.id)}
                      disabled={!newComment[attachment.id]?.trim()}
                      className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Siųsti"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

