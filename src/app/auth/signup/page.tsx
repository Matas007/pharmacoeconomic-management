'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, X } from 'lucide-react'

type PasswordStrength = 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | null

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Slaptažodžio kriterijų tikrinimas
  const passwordCriteria = useMemo(() => {
    const password = formData.password
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
  }, [formData.password])

  // Slaptažodžio stiprumo skaičiavimas
  const passwordStrength = useMemo((): PasswordStrength => {
    const password = formData.password
    if (!password) return null

    const criteriaCount = Object.values(passwordCriteria).filter(Boolean).length
    
    if (criteriaCount === 0) return 'very-weak'
    if (criteriaCount === 1) return 'very-weak'
    if (criteriaCount === 2) return 'weak'
    if (criteriaCount === 3) return 'fair'
    if (criteriaCount === 4) return 'good'
    return 'strong'
  }, [formData.password, passwordCriteria])

  const getStrengthConfig = (strength: PasswordStrength) => {
    switch (strength) {
      case 'very-weak':
        return {
          label: 'Labai silpnas',
          color: 'bg-red-600',
          widthClass: 'progress-20'
        }
      case 'weak':
        return {
          label: 'Silpnas',
          color: 'bg-orange-500',
          widthClass: 'progress-40'
        }
      case 'fair':
        return {
          label: 'Vidutinis',
          color: 'bg-yellow-500',
          widthClass: 'progress-60'
        }
      case 'good':
        return {
          label: 'Geras',
          color: 'bg-lime-500',
          widthClass: 'progress-80'
        }
      case 'strong':
        return {
          label: 'Labai stiprus',
          color: 'bg-green-600',
          widthClass: 'progress-100'
        }
      default:
        return null
    }
  }

  const strengthConfig = passwordStrength ? getStrengthConfig(passwordStrength) : null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Slaptažodžiai nesutampa')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (response.ok) {
        router.push('/auth/signin?message=Registracija sėkminga')
      } else {
        const data = await response.json()
        setError(data.error || 'Registracijos klaida')
      }
    } catch (error) {
      setError('Įvyko klaida. Bandykite dar kartą.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 max-h-[95vh] overflow-y-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Registracija</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Sukurkite naują paskyrą</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Vardas
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-target"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              El. paštas
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-target"
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-target"
              required
            />
            
            {/* Slaptažodžio stiprumo indikatorius */}
            {formData.password && strengthConfig && (
              <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full ${strengthConfig.color} ${strengthConfig.widthClass} transition-all duration-300 ease-out absolute top-0 left-0`}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className="text-[10px] sm:text-xs font-medium text-gray-700">
                      Stiprumas: <span className="font-semibold">{strengthConfig.label}</span>
                    </span>
                  </div>
                </div>
                
                {/* Kriterijai su varnelėmis */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center ${
                      passwordCriteria.length ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {passwordCriteria.length ? (
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
                      ) : (
                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" strokeWidth={3} />
                      )}
                    </div>
                    <span className={passwordCriteria.length ? 'text-gray-700' : 'text-gray-500'}>
                      Bent 8 simboliai
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center ${
                      passwordCriteria.uppercase ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {passwordCriteria.uppercase ? (
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
                      ) : (
                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" strokeWidth={3} />
                      )}
                    </div>
                    <span className={passwordCriteria.uppercase ? 'text-gray-700' : 'text-gray-500'}>
                      Turi didžiąją raidę
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center ${
                      passwordCriteria.lowercase ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {passwordCriteria.lowercase ? (
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
                      ) : (
                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" strokeWidth={3} />
                      )}
                    </div>
                    <span className={passwordCriteria.lowercase ? 'text-gray-700' : 'text-gray-500'}>
                      Turi mažąją raidę
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center ${
                      passwordCriteria.number ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {passwordCriteria.number ? (
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
                      ) : (
                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" strokeWidth={3} />
                      )}
                    </div>
                    <span className={passwordCriteria.number ? 'text-gray-700' : 'text-gray-500'}>
                      Turi skaičių
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center ${
                      passwordCriteria.special ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {passwordCriteria.special ? (
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
                      ) : (
                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" strokeWidth={3} />
                      )}
                    </div>
                    <span className={passwordCriteria.special ? 'text-gray-700' : 'text-gray-500'}>
                      Turi specialų simbolį
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Patvirtinti slaptažodį
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-target"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 transition duration-200 text-sm sm:text-base font-medium touch-target"
          >
            {loading ? 'Registruojama...' : 'Prisiregistruoti'}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Jau turite paskyrą?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium">
              Prisijunkite
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
