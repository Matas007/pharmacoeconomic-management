'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'

interface FilterOptions {
  population: string[]
  intervention: string[]
  comparator: string[]
  outcome: string[]
  timeHorizon: string
  perspective: string
  discountRate: string
}

export default function NewRequest() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const draftIdRef = useRef<string | null>(null)
  const isSubmittedRef = useRef(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM'
  })

  const [filters, setFilters] = useState<FilterOptions>({
    population: [],
    intervention: [],
    comparator: [],
    outcome: [],
    timeHorizon: '',
    perspective: '',
    discountRate: ''
  })

  // Inicializuoti draft tracking kai vartotojas atidaro formą
  useEffect(() => {
    const initDraft = async () => {
      try {
        const res = await fetch('/api/analytics/request-draft', {
          method: 'POST'
        })
        if (res.ok) {
          const data = await res.json()
          draftIdRef.current = data.draftId
        }
      } catch (err) {
        console.error('Klaida kuriant draft:', err)
      }
    }

    initDraft()

    // Cleanup - pažymėti kaip abandoned jei išeina be submit
    return () => {
      if (draftIdRef.current && !isSubmittedRef.current) {
        fetch('/api/analytics/request-draft', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draftId: draftIdRef.current,
            abandoned: true
          })
        }).catch(err => console.error('Klaida baigiant draft:', err))
      }
    }
  }, [])

  // Auto-save form data periodiškai (kas 10 sekundžių)
  useEffect(() => {
    if (!draftIdRef.current) return

    const interval = setInterval(() => {
      fetch('/api/analytics/request-draft', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId: draftIdRef.current,
          formData: { ...formData, filters }
        })
      }).catch(err => console.error('Klaida auto-save:', err))
    }, 10000) // 10 sekundžių

    return () => clearInterval(interval)
  }, [formData, filters])

  const populationOptions = [
    'Vidutinio amžiaus suaugę (18-65 m.)',
    'Vyresnio amžiaus (65+ m.)',
    'Vaikai (0-18 m.)',
    'Onkologiniai ligoniai',
    'Diabetikai',
    'Hipertenzijos ligoniai',
    'Kardiologiniai ligoniai'
  ]

  const interventionOptions = [
    'Naujas vaistas',
    'Kombinuota terapija',
    'Dozės optimizavimas',
    'Terapijos trukmės keitimas',
    'Prevencinė terapija',
    'Paliatyvi terapija'
  ]

  const comparatorOptions = [
    'Standartinė terapija',
    'Placebo',
    'Alternatyvus vaistas',
    'Chirurginis gydymas',
    'Fizinis gydymas',
    'Nėra gydymo'
  ]

  const outcomeOptions = [
    'Gyvenimo kokybė (QALY)',
    'Gyvenimo trukmė (LY)',
    'Klinikinis rezultatas',
    'Nepageidaujamų reiškinių sumažėjimas',
    'Ligoninės dienos',
    'Darbo dienų praradimas'
  ]

  const handleFilterChange = (category: keyof FilterOptions, value: string) => {
    if (category === 'population' || category === 'intervention' || category === 'comparator' || category === 'outcome') {
      setFilters(prev => ({
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter(item => item !== value)
          : [...prev[category], value]
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        [category]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/user/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          filters: JSON.stringify(filters)
        }),
      })

      if (response.ok) {
        setSuccess(true)
        isSubmittedRef.current = true // Pažymėti, kad sėkmingai submit'ino

        // Užbaigti draft kaip completed
        if (draftIdRef.current) {
          await fetch('/api/analytics/request-draft', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              draftId: draftIdRef.current,
              completed: true,
              abandoned: false
            })
          }).catch(err => console.error('Klaida baigiant draft:', err))
        }

        // Redirect po 2 sekundžių
        setTimeout(() => {
          router.push('/user/dashboard')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Užklausos siuntimo klaida')
      }
    } catch (error) {
      setError('Įvyko klaida. Bandykite dar kartą.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href="/user/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atgal
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Nauja užklausa
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Pagrindinė informacija */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pagrindinė informacija
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Užklausos pavadinimas *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Aprašymas *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Prioritetas
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Žemas</option>
                  <option value="MEDIUM">Vidutinis</option>
                  <option value="HIGH">Aukštas</option>
                  <option value="URGENT">Skubus</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filtrai */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Farmakoekonominio modeliavimo filtrai
            </h2>

            <div className="space-y-6">
              {/* Populiacija */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tikslinė populiacija
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {populationOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.population.includes(option)}
                        onChange={() => handleFilterChange('population', option)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Intervencija */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Intervencija
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {interventionOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.intervention.includes(option)}
                        onChange={() => handleFilterChange('intervention', option)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Palyginimas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Palyginimas
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {comparatorOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.comparator.includes(option)}
                        onChange={() => handleFilterChange('comparator', option)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rezultatai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rezultatai
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {outcomeOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.outcome.includes(option)}
                        onChange={() => handleFilterChange('outcome', option)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Papildomi parametrai */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="timeHorizon" className="block text-sm font-medium text-gray-700 mb-2">
                    Laiko horizontas
                  </label>
                  <select
                    id="timeHorizon"
                    value={filters.timeHorizon}
                    onChange={(e) => handleFilterChange('timeHorizon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pasirinkite...</option>
                    <option value="1-year">1 metai</option>
                    <option value="5-years">5 metai</option>
                    <option value="10-years">10 metų</option>
                    <option value="lifetime">Visą gyvenimą</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="perspective" className="block text-sm font-medium text-gray-700 mb-2">
                    Perspektyva
                  </label>
                  <select
                    id="perspective"
                    value={filters.perspective}
                    onChange={(e) => handleFilterChange('perspective', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pasirinkite...</option>
                    <option value="healthcare">Sveikatos apsaugos</option>
                    <option value="societal">Visuomenės</option>
                    <option value="payer">Mokėtojo</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="discountRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Diskonto norma (%)
                  </label>
                  <select
                    id="discountRate"
                    value={filters.discountRate}
                    onChange={(e) => handleFilterChange('discountRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pasirinkite...</option>
                    <option value="0">0%</option>
                    <option value="3">3%</option>
                    <option value="5">5%</option>
                    <option value="7">7%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✓ Užklausa sėkmingai išsiųsta! Nukreipiama į dashboard...
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition duration-200 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Siunčiama...' : 'Siųsti užklausą'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
