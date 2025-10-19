'use client'

import { useState, useEffect } from 'react'
import { 
  BellIcon, 
  UserCircleIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
  }, [])

  return (
    <header className="bg-gradient-to-r from-white via-purple-50/30 to-blue-50/50 shadow-xl border-b border-purple-200/50 backdrop-blur-sm flex-shrink-0">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Page title will be set by individual pages */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="text-sm font-medium text-gray-700 bg-gradient-to-r from-white to-purple-50/80 px-4 py-2 rounded-full shadow-md border border-purple-100">
                {currentDate}
              </div>
            </div>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 group">
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-rose-400 to-red-500 rounded-full animate-pulse shadow-sm"></span>
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
                Notifications
              </div>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-white/80 rounded-xl transition-all duration-200 group border border-transparent hover:border-purple-200 hover:shadow-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <UserCircleIcon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-800">Admin User</div>
                  <div className="text-xs text-gray-500">System Administrator</div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl py-2 z-50 border border-purple-100 slide-up">
                  <div className="px-4 py-2 border-b border-purple-100 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
                    <div className="text-sm font-semibold text-gray-800">Admin User</div>
                    <div className="text-xs text-gray-500">admin@gazstation.com</div>
                  </div>
                  <button className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700 transition-all duration-200">
                    <UserCircleIcon className="h-4 w-4 mr-3" />
                    Profile Settings
                  </button>
                  <button className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700 transition-all duration-200">
                    <Cog6ToothIcon className="h-4 w-4 mr-3" />
                    System Settings
                  </button>
                  <hr className="my-2 border-purple-100" />
                  <button className="flex items-center w-full px-4 py-3 text-sm text-rose-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50 transition-all duration-200">
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
