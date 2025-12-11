'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Star, MessageSquare, TrendingUp } from 'lucide-react'

interface FeedbackData {
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
  comment: string
}

export default function FeedbackPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [showFullForm, setShowFullForm] = useState(false)
  const [hasFeedback, setHasFeedback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const draftIdRef = useRef<string | null>(null)
  const isSubmittedRef = useRef(false)
  const [feedback, setFeedback] = useState<FeedbackData>({
    easeOfUse: 5,
    speed: 5,
    colorPalette: 5,
    fontStyle: 5,
    fontReadability: 5,
    contentClarity: 5,
    contentAmount: 5,
    tone: 5,
    reliability: 5,
    communication: 5,
    comment: ''
  })

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

  useEffect(() => {
    // Patikrinti ar vartotojas jau paliko atsiliepimą
    const checkFeedback = async () => {
      try {
        const res = await fetch('/api/feedback')
        const data = await res.json()
        
        if (data.feedback) {
          setHasFeedback(true)
        } else {
          // Rodyti pranešimą po 5 sekundžių, jei nepaliko atsiliepimo
          const timer = setTimeout(() => {
            setShowPrompt(true)
          }, 5000)
          
          return () => clearTimeout(timer)
        }
      } catch (error) {
        console.error('Klaida tikrinant atsiliepimą:', error)
      }
    }

    checkFeedback()
  }, [])

  // Tracking: Pradėti kai atidaro pilną formą
  useEffect(() => {
    if (showFullForm && !draftIdRef.current) {
      // Sukurti draft
      fetch('/api/analytics/feedback-draft', {
        method: 'POST'
      })
        .then(res => res.json())
        .then(data => {
          if (data.draftId) {
            draftIdRef.current = data.draftId
          }
        })
        .catch(err => console.error('Klaida kuriant feedback draft:', err))
    }

    // Cleanup - pažymėti kaip abandoned jei uždaro be submit
    return () => {
      if (draftIdRef.current && !isSubmittedRef.current && !showFullForm) {
        fetch('/api/analytics/feedback-draft', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draftId: draftIdRef.current,
            abandoned: true
          })
        }).catch(err => console.error('Klaida baigiant feedback draft:', err))
      }
    }
  }, [showFullForm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      })

      if (res.ok) {
        isSubmittedRef.current = true // Pažymėti, kad sėkmingai submit'ino

        // Užbaigti draft kaip completed
        if (draftIdRef.current) {
          await fetch('/api/analytics/feedback-draft', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              draftId: draftIdRef.current,
              completed: true,
              abandoned: false
            })
          }).catch(err => console.error('Klaida baigiant feedback draft:', err))
        }

        setShowFullForm(false)
        setShowPrompt(false)
        setHasFeedback(true)
        alert('Ačiū už jūsų atsiliepimą! 🙏')
      } else {
        const data = await res.json()
        alert(data.error || 'Klaida siunčiant atsiliepimą')
      }
    } catch (error) {
      console.error('Klaida siunčiant atsiliepimą:', error)
      alert('Klaida siunčiant atsiliepimą')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateMetric = (key: string, value: number) => {
    setFeedback(prev => ({ ...prev, [key]: value }))
  }

  if (hasFeedback) return null

  return (
    <>
      {/* Pradinis pranešimas */}
      {showPrompt && !showFullForm && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm border-2 border-blue-500">
            <button
              onClick={() => setShowPrompt(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              aria-label="Uždaryti"
              title="Uždaryti"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Įvertinkite savo patirtį
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Jūsų nuomonė mums labai svarbi! Padėkite mums pagerinti sistemą.
            </p>
            
            <button
              onClick={() => {
                setShowPrompt(false)
                setShowFullForm(true)
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Palikti atsiliepimą
            </button>
            
            <button
              onClick={() => setShowPrompt(false)}
              className="w-full mt-2 text-gray-500 text-sm hover:text-gray-700"
            >
              Galbūt vėliau
            </button>
          </div>
        </div>
      )}

      {/* Pilna feedback forma */}
      {showFullForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Įvertinkite savo patirtį
                  </h2>
                  <p className="text-sm text-gray-600">
                    Įvertinkite kiekvieną aspektą nuo 1 (blogai) iki 10 (puikiai)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullForm(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Uždaryti"
                title="Uždaryti"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Metrikos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metrics.map(({ key, label, icon }) => (
                  <div key={key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span className="text-2xl">{icon}</span>
                      {label}
                      <span className="ml-auto text-blue-600 text-lg">
                        {feedback[key as keyof FeedbackData]}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={feedback[key as keyof FeedbackData]}
                      onChange={(e) => updateMetric(key, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      aria-label={label}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Komentaras */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MessageSquare className="w-5 h-5" />
                  Papildomas komentaras (nebūtinas)
                </label>
                <textarea
                  value={feedback.comment}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Pasidalinkite savo mintimis..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Mygtukai */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowFullForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Atšaukti
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Siunčiama...
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5" />
                      Pateikti atsiliepimą
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

