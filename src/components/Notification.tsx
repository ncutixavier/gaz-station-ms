'use client'

import { useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface NotificationProps {
  type: 'success' | 'error'
  message: string
  onClose: () => void
  duration?: number
}

export function Notification({ type, message, onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  const isSuccess = type === 'success'
  const bgGradient = isSuccess 
    ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
    : 'bg-gradient-to-r from-red-50 to-rose-50'
  const borderColor = isSuccess ? 'border-green-200' : 'border-red-200'
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800'
  const iconBg = isSuccess ? 'bg-green-100' : 'bg-red-100'
  const iconColor = isSuccess ? 'text-green-600' : 'text-red-600'
  const Icon = isSuccess ? CheckCircleIcon : XCircleIcon

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${bgGradient} ${borderColor} border rounded-xl shadow-xl backdrop-blur-sm slide-up`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-semibold ${textColor}`}>
              {message}
            </p>
            <p className={`text-xs ${textColor} opacity-75 mt-1`}>
              {isSuccess ? 'Operation completed successfully' : 'Please check and try again'}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className={`inline-flex ${textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full p-1 transition-all duration-200 hover:bg-white/50`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-white/30 rounded-b-xl overflow-hidden">
        <div 
          className={`h-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'} transition-all duration-${duration} ease-linear`}
          style={{ 
            width: '100%',
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
