'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, X, Send, Lock, AlertCircle } from 'lucide-react'

interface ChatRoom {
  id: string
  name: string
  type: string
}

interface Message {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    role: string
  }
}

export default function Chat() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [needsSetup, setNeedsSetup] = useState(false)
  const [setupMode, setSetupMode] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchRooms()
    }
  }, [isOpen])

  useEffect(() => {
    if (isUnlocked && selectedRoom) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
      return () => clearInterval(interval)
    }
  }, [isUnlocked, selectedRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isBlocked && blockTimeRemaining > 0) {
      const interval = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBlocked(false)
            return 0
          }
          return prev - 1
        })
      }, 60000) // Update every minute
      return () => clearInterval(interval)
    }
  }, [isBlocked, blockTimeRemaining])

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/chat/rooms')
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      }
    } catch (error) {
      console.error('Klaida gaunant room\'us:', error)
    }
  }

  const fetchMessages = async () => {
    if (!selectedRoom) return

    try {
      const res = await fetch(`/api/chat/messages?roomId=${selectedRoom.id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Klaida gaunant žinutes:', error)
    }
  }

  const handleSetupPin = async () => {
    if (pin.length !== 4) {
      setPinError('PIN turi būti 4 skaitmenys')
      return
    }

    if (confirmPin.length !== 4) {
      setPinError('Patvirtinkite PIN (4 skaitmenys)')
      return
    }

    if (pin !== confirmPin) {
      setPinError('PIN kodai nesutampa')
      return
    }

    try {
      const res = await fetch('/api/user/setup-chat-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pin, confirmPin })
      })

      const data = await res.json()

      if (res.ok) {
        setPinError('')
        setPin('')
        setConfirmPin('')
        setNeedsSetup(false)
        setSetupMode(false)
        // Po setup, rodyti verify formą
      } else {
        setPinError(data.error || data.message || 'Klaida kuriant PIN')
      }
    } catch (error) {
      console.error('Klaida kuriant PIN:', error)
      setPinError('Serverio klaida')
    }
  }

  const handleVerifyPin = async () => {
    if (!selectedRoom || pin.length !== 4) {
      setPinError('PIN turi būti 4 skaitmenys')
      return
    }

    try {
      const res = await fetch('/api/chat/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          pin
        })
      })

      const data = await res.json()

      if (res.ok) {
        setIsUnlocked(true)
        setPinError('')
        setPin('')
      } else {
        if (data.blocked) {
          setIsBlocked(true)
          setBlockTimeRemaining(data.remainingMinutes)
          setPinError(data.message)
        } else {
          setPinError(data.message || 'Neteisingas PIN')
        }
        setPin('')
      }
    } catch (error) {
      console.error('Klaida tikrinant PIN:', error)
      setPinError('Serverio klaida')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoom) return

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          content: newMessage
        })
      })

      if (res.ok) {
        setNewMessage('')
        fetchMessages()
      }
    } catch (error) {
      console.error('Klaida siunčiant žinutę:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleRoomSelect = async (room: ChatRoom) => {
    setSelectedRoom(room)
    setIsUnlocked(false)
    setPin('')
    setConfirmPin('')
    setPinError('')
    setMessages([])
    setSetupMode(false)

    // Tikrinti ar reikia sukurti PIN (tik USER rolei)
    if (session?.user?.role === 'USER') {
      try {
        const res = await fetch('/api/user/check-chat-pin')
        if (res.ok) {
          const data = await res.json()
          if (data.needsSetup) {
            setNeedsSetup(true)
            setSetupMode(true)
          } else {
            setNeedsSetup(false)
            setSetupMode(false)
          }
        }
      } catch (error) {
        console.error('Klaida tikrinant PIN:', error)
      }
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedRoom(null)
    setIsUnlocked(false)
    setPin('')
    setConfirmPin('')
    setPinError('')
    setMessages([])
    setIsBlocked(false)
    setNeedsSetup(false)
    setSetupMode(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-600'
      case 'IT_SPECIALIST':
        return 'text-purple-600'
      case 'QUALITY_EVALUATOR':
        return 'text-blue-600'
      case 'USER':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin'
      case 'IT_SPECIALIST':
        return 'IT'
      case 'QUALITY_EVALUATOR':
        return 'Kokybė'
      case 'USER':
        return 'Vartotojas'
      default:
        return role
    }
  }

  // Funkcija patikrinti ar dvi datos yra tą pačią dieną
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  // Funkcija formatuoti datą
  const formatDateSeparator = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (isSameDay(date, today)) {
      return 'Šiandien'
    } else if (isSameDay(date, yesterday)) {
      return 'Vakar'
    } else {
      return date.toLocaleDateString('lt-LT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  // Funkcija sugrupuoti žinutes pagal dienas
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: Date; messages: Message[] }[] = []
    
    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt)
      const lastGroup = groups[groups.length - 1]
      
      if (!lastGroup || !isSameDay(lastGroup.date, messageDate)) {
        groups.push({
          date: messageDate,
          messages: [message]
        })
      } else {
        lastGroup.messages.push(message)
      }
    })
    
    return groups
  }

  if (!session) return null

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors z-40 touch-target"
        title="Atidaryti chat"
        aria-label="Atidaryti chat"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl h-[90vh] sm:h-[600px] flex flex-col safe-area-inset-bottom">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-blue-600 text-white rounded-t-2xl sm:rounded-t-lg flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="truncate">{selectedRoom ? selectedRoom.name : 'Pokalbiai'}</span>
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-blue-700 active:bg-blue-800 rounded transition-colors touch-target flex-shrink-0"
                title="Uždaryti"
                aria-label="Uždaryti chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {!selectedRoom ? (
                /* Room Selection */
                <div className="p-4 sm:p-6 overflow-y-auto">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Pasirinkite chat kambarį:
                  </h3>
                  {rooms.length === 0 ? (
                    <p className="text-sm sm:text-base text-gray-600">Nėra prieinamų chat kambarių</p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {rooms.map((room) => (
                        <button
                          key={room.id}
                          onClick={() => handleRoomSelect(room)}
                          className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-blue-50 active:bg-blue-100 hover:border-blue-400 transition-colors text-left touch-target"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm sm:text-base text-gray-900 truncate">{room.name}</span>
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : !isUnlocked ? (
                /* PIN Entry */
                <div className="p-4 sm:p-6 flex items-center justify-center flex-1 overflow-y-auto">
                  <div className="w-full max-w-sm">
                    <div className="text-center mb-4 sm:mb-6">
                      <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        {setupMode ? 'Sukurkite savo PIN' : 'Įveskite PIN kodą'}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {setupMode ? 'Pirma karta - sukurkite 4 skaitmenų PIN' : '4 skaitmenų PIN kodas'}
                      </p>
                    </div>

                    {isBlocked ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm sm:text-base text-red-800 font-medium">Prieiga užblokuota</p>
                            <p className="text-xs sm:text-sm text-red-700 mt-1">
                              Liko {blockTimeRemaining} min. dėl per daug neteisingų bandymų.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : setupMode ? (
                      <>
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Naujas PIN (4 skaitmenys)
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={4}
                              value={pin}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '')
                                setPin(value)
                                setPinError('')
                              }}
                              className="w-full px-4 py-2.5 sm:py-3 text-center text-xl sm:text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-target"
                              placeholder="••••"
                              autoFocus
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Patvirtinkite PIN
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={4}
                              value={confirmPin}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '')
                                setConfirmPin(value)
                                setPinError('')
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && pin.length === 4 && confirmPin.length === 4) {
                                  handleSetupPin()
                                }
                              }}
                              className="w-full px-4 py-2.5 sm:py-3 text-center text-xl sm:text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-target"
                              placeholder="••••"
                            />
                          </div>
                        </div>

                        {pinError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 mt-3 sm:mt-4">
                            <p className="text-xs sm:text-sm text-red-800">{pinError}</p>
                          </div>
                        )}

                        <button
                          onClick={handleSetupPin}
                          disabled={pin.length !== 4 || confirmPin.length !== 4}
                          className="w-full px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-target mt-4"
                        >
                          Sukurti PIN
                        </button>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-600">
                            ℹ️ Šis PIN bus naudojamas prisijungimui prie chat su Admin. Įsiminkite jį!
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          value={pin}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '')
                            setPin(value)
                            setPinError('')
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && pin.length === 4) {
                              handleVerifyPin()
                            }
                          }}
                          className="w-full px-4 py-2.5 sm:py-3 text-center text-xl sm:text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3 sm:mb-4 touch-target"
                          placeholder="••••"
                          autoFocus
                        />

                        {pinError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
                            <p className="text-xs sm:text-sm text-red-800">{pinError}</p>
                          </div>
                        )}

                        <button
                          onClick={handleVerifyPin}
                          disabled={pin.length !== 4}
                          className="w-full px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-target"
                        >
                          Patvirtinti
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setSelectedRoom(null)
                        setPin('')
                        setConfirmPin('')
                        setPinError('')
                        setIsBlocked(false)
                        setNeedsSetup(false)
                        setSetupMode(false)
                      }}
                      className="w-full mt-3 px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 active:text-gray-900 transition-colors touch-target"
                    >
                      ← Atgal
                    </button>
                  </div>
                </div>
              ) : (
                /* Chat Messages */
                <>
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm sm:text-base">Dar nėra žinučių</p>
                        <p className="text-xs sm:text-sm">Būkite pirmas!</p>
                      </div>
                    ) : (
                      groupMessagesByDate(messages).map((group, groupIndex) => (
                        <div key={groupIndex} className="mb-3 sm:mb-4">
                          {/* Date Separator */}
                          <div className="flex items-center justify-center my-3 sm:my-4">
                            <div className="bg-gray-200 rounded-full px-2.5 sm:px-3 py-1">
                              <span className="text-[10px] sm:text-xs font-medium text-gray-600">
                                {formatDateSeparator(group.date)}
                              </span>
                            </div>
                          </div>

                          {/* Messages for this day */}
                          <div className="space-y-2 sm:space-y-3">
                            {group.messages.map((message) => {
                              const isOwnMessage = message.user.id === session.user.id
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-2.5 sm:p-3 ${
                                      isOwnMessage
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                      <span
                                        className={`text-[10px] sm:text-xs font-medium ${
                                          isOwnMessage ? 'text-blue-100' : getRoleColor(message.user.role)
                                        }`}
                                      >
                                        {message.user.name}
                                      </span>
                                      <span
                                        className={`text-[9px] sm:text-xs ${
                                          isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                                        }`}
                                      >
                                        ({getRoleLabel(message.user.role)})
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                    <span
                                      className={`text-[10px] sm:text-xs ${
                                        isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                                      } mt-1 block`}
                                    >
                                      {new Date(message.createdAt).toLocaleTimeString('lt-LT', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t flex-shrink-0 safe-area-inset-bottom">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Rašykite žinutę..."
                        className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-target"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target flex-shrink-0"
                        title="Siųsti"
                        aria-label="Siųsti žinutę"
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

