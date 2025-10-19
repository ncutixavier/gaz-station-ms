'use client'

import { useEffect, useState } from 'react'
import { 
  ChartBarIcon, 
  CubeIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { StockChart } from '@/components/StockChart'
import { PriceChart } from '@/components/PriceChart'

interface DashboardStats {
  totalProducts: number
  totalBlocks: number
  totalCashiers: number
  totalSales: number
  lowStockItems: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalBlocks: 0,
    totalCashiers: 0,
    totalSales: 0,
    lowStockItems: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, blocksRes, cashiersRes, salesRes, stockRes] = await Promise.all([
          fetch('/api/v1/products?page=1&pageSize=1'),
          fetch('/api/v1/blocks?page=1&pageSize=1'),
          fetch('/api/v1/cashiers?page=1&pageSize=1'),
          fetch('/api/v1/sales?page=1&pageSize=1'),
          fetch('/api/v1/stock?page=1&pageSize=100')
        ])

        const [products, blocks, cashiers, sales, stock] = await Promise.all([
          productsRes.json(),
          blocksRes.json(),
          cashiersRes.json(),
          salesRes.json(),
          stockRes.json()
        ])

        const lowStockCount = stock.data?.filter((item: any) => item.quantity < 1000).length || 0

        setStats({
          totalProducts: products.total || 0,
          totalBlocks: blocks.total || 0,
          totalCashiers: cashiers.total || 0,
          totalSales: sales.total || 0,
          lowStockItems: lowStockCount
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: CubeIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Blocks',
      value: stats.totalBlocks,
      icon: ChartBarIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Cashiers',
      value: stats.totalCashiers,
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Total Sales',
      value: stats.totalSales,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Gas Station Management System Overview</p>
        </div>
        
        {/* Month/Year Selector */}
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="form-input text-sm text-gray-900"
          >
            {monthNames.map((month, index) => (
              <option key={index + 1} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="form-input text-sm text-gray-900"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {stats.lowStockItems > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Low Stock Alert</h3>
            <p className="text-sm text-red-600">
              {stats.lowStockItems} product(s) have low stock levels
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StockChart month={selectedMonth} year={selectedYear} />
        <PriceChart month={selectedMonth} year={selectedYear} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/block-shifts"
              className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h4 className="font-medium text-blue-900">Record Pump Readings</h4>
              <p className="text-sm text-blue-600">Enter start and end indexes for current shift</p>
            </a>
            <a
              href="/stock"
              className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h4 className="font-medium text-green-900">Update Stock Levels</h4>
              <p className="text-sm text-green-600">Manage product inventory levels</p>
            </a>
            <a
              href="/prices"
              className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <h4 className="font-medium text-purple-900">Manage Prices</h4>
              <p className="text-sm text-purple-600">Update product pricing and view history</p>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Connection</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm text-gray-900">Today, 2:30 AM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Chart Data</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {monthNames[selectedMonth - 1]} {selectedYear}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}