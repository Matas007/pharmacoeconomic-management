'use client'

import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, RefreshCw, Check } from 'lucide-react'

export default function ChatPinSettings() {
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [isCustom, setIsCustom] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCurrentPin()
  }, [])

  const fetchCurrentPin = async () => {
    try {
      const res = await fetch('/api/user/chat-pin')
      if (res.ok) {
        const data = await res.json()
        setCurrentPin(data.chatPin)
        setIsCustom(data.isCustom)
      }
    } catch (err) {
      console.error('Klaida gaunant PIN:', err)
    }
  }

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    // Validacija
    if (!/^\d{4}$/.test(newPin)) {
      setError('PIN turi būti 4 skaitmenys')
      return
    }

    if (newPin !== confirmPin) {
      setError('PIN nesutampa')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/chat-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: newPin })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Chat PIN sėkmingai pakeistas!')
        setCurrentPin(newPin)
        setIsCustom(true)
        setNewPin('')
        setConfirmPin('')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(data.error || 'Klaida keičiant PIN')
      }
    } catch (err) {
      setError('Serverio klaida')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPin = async () => {
    if (!confirm('Ar tikrai norite atstatyti PIN į numatytąjį (5678)?')) {
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/user/chat-pin', {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('PIN atstatytas į numatytąjį!')
        setCurrentPin('5678')
        setIsCustom(false)
        setNewPin('')
        setConfirmPin('')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(data.error || 'Klaida atkuriant PIN')
      }
    } catch (err) {
      setError('Serverio klaida')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <Lock className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Chat PIN Nustatymai</h2>
      </div>

      <div className="space-y-4">
        {/* Dabartinis PIN */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Dabartinis PIN:</p>
          <div className="flex items-center gap-2">
            <code className="text-lg font-mono font-bold text-gray-900">
              {showPin ? currentPin : '••••'}
            </code>
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {isCustom && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Custom
              </span>
            )}
          </div>
        </div>

        {/* Naujas PIN forma */}
        <form onSubmit={handleUpdatePin} className="space-y-3">
          <div>
            <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-1">
              Naujas PIN (4 skaitmenys)
            </label>
            <input
              type="text"
              id="newPin"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              placeholder="0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg"
            />
          </div>

          <div>
            <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-1">
              Patvirtinti PIN
            </label>
            <input
              type="text"
              id="confirmPin"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              placeholder="0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              {message}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !newPin || !confirmPin}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition duration-200 font-medium"
            >
              {loading ? 'Išsaugoma...' : 'Išsaugoti PIN'}
            </button>

            {isCustom && (
              <button
                type="button"
                onClick={handleResetPin}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 transition duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Atstatyti
              </button>
            )}
          </div>
        </form>

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">ℹ️ Informacija:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>PIN naudojamas prisijungimui prie chat su Admin</li>
            <li>PIN turi būti 4 skaitmenys (pvz., 1234)</li>
            <li>Numatytasis PIN: 5678</li>
            <li>Galite pakeisti bet kada</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

