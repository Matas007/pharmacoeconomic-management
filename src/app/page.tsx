import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    if (session.user.role === 'ADMIN') {
      redirect('/admin/dashboard')
    } else if (session.user.role === 'QUALITY_EVALUATOR') {
      redirect('/quality-evaluator/dashboard')
    } else if (session.user.role === 'IT_SPECIALIST') {
      redirect('/it-specialist/dashboard')
    } else {
      redirect('/user/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Farmakoekonominio modeliavimo sistema
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Valdyti užklausas Kanban lentoje efektyviai
          </p>
          
          <div className="space-y-3 sm:space-y-4">
            <Link
              href="/auth/signin"
              className="w-full bg-blue-600 text-white py-3 sm:py-3.5 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition duration-200 block text-center font-medium touch-target"
            >
              Prisijungti
            </Link>
            
            <Link
              href="/auth/signup"
              className="w-full bg-gray-100 text-gray-700 py-3 sm:py-3.5 px-4 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition duration-200 block text-center font-medium touch-target"
            >
              Prisiregistruoti
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
