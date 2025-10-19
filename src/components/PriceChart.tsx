'use client'

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface PriceChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: (number | null)[]
    borderColor: string
    backgroundColor: string
    tension: number
    fill: boolean
    pointRadius: number
    pointHoverRadius: number
  }>
  summary: {
    totalPriceChanges: number
    products: number
    dateRange: {
      start: string
      end: string
    }
  }
}

interface PriceChartProps {
  month?: number
  year?: number
}

export function PriceChart({ month, year }: PriceChartProps) {
  const [chartData, setChartData] = useState<PriceChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (month) params.append('month', month.toString())
        if (year) params.append('year', year.toString())
        
        const response = await fetch(`/api/v1/dashboard/price-chart?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch price chart data')
        }
        
        const data = await response.json()
        setChartData(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [month, year])

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-purple-200/50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
        </div>
        <p className="text-center text-gray-600 font-medium">Loading price data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-purple-200/50 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-500">⚠️</span>
          </div>
          <p className="text-red-600 font-medium">Error loading chart data</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!chartData || chartData.datasets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-purple-200/50 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">💰</span>
          </div>
          <p className="text-gray-600 font-medium">No price data available</p>
          <p className="text-gray-500 text-sm mt-1">No price changes found for the selected period</p>
        </div>
      </div>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500' as const
          }
        }
      },
      title: {
        display: true,
        text: 'Product Price Variations',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        color: '#374151'
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: $${value ? value.toFixed(2) : 'N/A'}`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price ($)',
          font: {
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(2)
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-xl border border-purple-200/50 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Price Trends</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            {chartData.summary.products} Products
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            {chartData.summary.totalPriceChanges} Price Changes
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            {chartData.summary.dateRange.start} to {chartData.summary.dateRange.end}
          </span>
        </div>
      </div>
      
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
