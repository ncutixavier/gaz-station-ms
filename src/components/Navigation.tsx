'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  CubeIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  CogIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Blocks', href: '/blocks', icon: CogIcon },
  { name: 'Cashiers', href: '/cashiers', icon: UserGroupIcon },
  { name: 'Shifts', href: '/shifts', icon: ClockIcon },
  { name: 'Block Shifts', href: '/block-shifts', icon: ClockIcon },
  { name: 'Stock', href: '/stock', icon: CubeIcon },
  { name: 'Prices', href: '/prices', icon: CurrencyDollarIcon },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-white via-purple-50/20 to-blue-50/30 shadow-2xl border-r border-purple-200/50 overflow-y-auto">
      <div className="p-6 border-b border-purple-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">⛽</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gas Station MS
            </h1>
            <p className="text-xs text-gray-500 font-medium">Management System</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl mb-2 transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50/80 hover:to-blue-50/80 hover:text-purple-700 hover:shadow-md hover:scale-105'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400 group-hover:text-purple-600'
                }`}
              />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse shadow-sm"></div>
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-200/50 bg-gradient-to-r from-white/80 to-purple-50/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse shadow-sm"></div>
          <span className="font-medium">System Online</span>
        </div>
      </div>
    </div>
  )
}
