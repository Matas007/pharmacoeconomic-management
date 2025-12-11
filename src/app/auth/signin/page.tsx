'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Neteisingas el. paštas arba slaptažodis')
      } else {
        const session = await getSession()
        if (session?.user.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else if (session?.user.role === 'QUALITY_EVALUATOR') {
          router.push('/quality-evaluator/dashboard')
        } else if (session?.user.role === 'IT_SPECIALIST') {
          router.push('/it-specialist/dashboard')
        } else {
          router.push('/user/dashboard')
        }
      }
    } catch (error) {
      setError('Įvyko klaida. Bandykite dar kartą.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Prisijungimas</h1>
          <p className="text-gray-600">Įveskite savo prisijungimo duomenis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              El. paštas
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Slaptažodis
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition duration-200"
          >
            {loading ? 'Prisijungiama...' : 'Prisijungti'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Neturite paskyros?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700">
              Registruokitės
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
