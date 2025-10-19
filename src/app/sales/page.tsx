'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/DataTable'

interface Sale {
  id: number
  blockShiftId: number
  productId: number
  litresSold: number
  totalRevenue: number
  createdAt: string
  updatedAt: string
  blockShift?: {
    id: number
    block?: {
      name: string
    }
    shift?: {
      name: string
    }
    cashier?: {
      name: string
    }
    date: string
  }
  product?: {
    id: number
    name: string
    unitPrice: number
  }
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const [summary, setSummary] = useState({
    totalLitresSold: 0,
    totalRevenue: 0,
    totalSales: 0
  })

  const fetchSales = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/sales?page=${page}&pageSize=${pageSize}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales')
      }
      
      const data = await response.json()
      setSales(data.data)
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev
      })

      // Calculate summary
      const totalLitres = data.data.reduce((sum: number, sale: Sale) => sum + sale.litresSold, 0)
      const totalRev = data.data.reduce((sum: number, sale: Sale) => sum + sale.totalRevenue, 0)
      setSummary({
        totalLitresSold: totalLitres,
        totalRevenue: totalRev,
        totalSales: data.total
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (sale: Sale) => (
        <div className="font-medium text-gray-900">
          {sale.product?.name || `Product ${sale.productId}`}
        </div>
      )
    },
    {
      key: 'blockShift',
      label: 'Block/Shift',
      render: (sale: Sale) => (
        <div className="text-gray-600">
          <div>{sale.blockShift?.block?.name || `Block ${sale.blockShiftId}`}</div>
          <div className="text-sm text-gray-500">
            {sale.blockShift?.shift?.name || 'Unknown Shift'}
          </div>
        </div>
      )
    },
    {
      key: 'cashier',
      label: 'Cashier',
      render: (sale: Sale) => (
        <div className="text-gray-600">
          {sale.blockShift?.cashier?.name || 'Unknown'}
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (sale: Sale) => (
        <div className="text-gray-600">
          {sale.blockShift?.date ? formatDate(sale.blockShift.date) : 'Unknown'}
        </div>
      )
    },
    {
      key: 'litresSold',
      label: 'Litres Sold',
      render: (sale: Sale) => (
        <div className="text-gray-900 font-medium">
          {sale.litresSold}L
        </div>
      )
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      render: (sale: Sale) => (
        <div className="text-gray-600">
          {sale.product?.unitPrice ? formatCurrency(sale.product.unitPrice) : 'N/A'}
        </div>
      )
    },
    {
      key: 'totalRevenue',
      label: 'Total Revenue',
      render: (sale: Sale) => (
        <div className="text-green-600 font-medium">
          {formatCurrency(sale.totalRevenue)}
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading sales...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600">View sales transactions and revenue</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalSales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Litres</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalLitresSold}L
              </p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={sales}
        columns={columns}
        pagination={pagination}
        onPageChange={(page) => fetchSales(page, pagination.pageSize)}
        onEdit={undefined} // Sales are read-only
        onDelete={undefined} // Sales are read-only
      />
    </div>
  )
}
