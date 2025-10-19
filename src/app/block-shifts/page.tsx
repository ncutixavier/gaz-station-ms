'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/DataTable'
import { BlockShiftForm } from '@/components/BlockShiftForm'
import { IndexForm } from '@/components/IndexForm'
import { Notification } from '@/components/Notification'
import { formatCurrency, formatLitres } from '@/lib/utils'

interface BlockShift {
  id: number
  blockId: number
  shiftId: number
  cashierId: number
  date: string
  createdAt: string
  updatedAt: string
  block?: {
    id: number
    name: string
  }
  shift?: {
    id: number
    name: string
  }
  cashier?: {
    id: number
    name: string
  }
  indexes?: Index[]
}

interface Index {
  id: number
  blockShiftId: number
  productId: number
  startIndex: number | string
  endIndex: number | string
  createdAt: string
  product?: {
    id: number
    name: string
    prices?: {
      id: number
      saleUnitPrice: number
    }
  }
}

export default function BlockShiftsPage() {
  const [blockShifts, setBlockShifts] = useState<BlockShift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingBlockShift, setEditingBlockShift] = useState<BlockShift | null>(null)
  const [showIndexForm, setShowIndexForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<Index | null>(null)
  const [selectedBlockShiftId, setSelectedBlockShiftId] = useState<number | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchBlockShifts = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true)
      let url = `/api/v1/block-shifts?page=${page}&pageSize=${pageSize}`
      
      // Add date range filtering
      if (dateRangeFilter.start && dateRangeFilter.end) {
        url += `&startDate=${dateRangeFilter.start}&endDate=${dateRangeFilter.end}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch block shifts')
      }
      
      const data = await response.json()
      console.log('Fetched block shifts data:', data.data)
      setBlockShifts(data.data)
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlockShifts()
  }, [dateRangeFilter])

  const toggleRowExpansion = (blockShiftId: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(blockShiftId)) {
      newExpandedRows.delete(blockShiftId)
    } else {
      newExpandedRows.add(blockShiftId)
    }
    setExpandedRows(newExpandedRows)
  }

  const applyFilters = () => {
    fetchBlockShifts(1, pagination.pageSize)
  }

  const clearFilters = () => {
    setDateRangeFilter({ start: '', end: '' })
    fetchBlockShifts(1, pagination.pageSize)
  }

  const handleCreate = async (blockShiftData: Omit<BlockShift, 'id' | 'createdAt' | 'updatedAt' | 'block' | 'shift' | 'cashier' | 'indexes'>) => {
    try {
      // Validate that all required IDs are provided and not 0
      if (blockShiftData.blockId === 0 || blockShiftData.shiftId === 0 || blockShiftData.cashierId === 0) {
        throw new Error('Please select valid block, shift, and cashier')
      }

      const response = await fetch('/api/v1/block-shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blockShiftData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create block shift')
      }

      setShowForm(false)
      setNotification({ type: 'success', message: 'Block shift created successfully!' })
      fetchBlockShifts(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const handleEdit = async (id: number, blockShiftData: Partial<BlockShift>) => {
    try {
      // Filter out fields with value 0 (invalid IDs)
      const filteredData = Object.fromEntries(
        Object.entries(blockShiftData).filter(([key, value]) => {
          if (key.includes('Id') && value === 0) return false
          return true
        })
      )

      const response = await fetch(`/api/v1/block-shifts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update block shift')
      }

      setEditingBlockShift(null)
      setNotification({ type: 'success', message: 'Block shift updated successfully!' })
      fetchBlockShifts(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this block shift?')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/block-shifts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete block shift')
      }

      setNotification({ type: 'success', message: 'Block shift deleted successfully!' })
      fetchBlockShifts(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleCreateIndex = async (indexData: Omit<Index, 'id' | 'createdAt'> | { startIndex: number; endIndex: number }) => {
    try {
      const response = await fetch('/api/v1/indexes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(indexData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create index')
      }

      setShowIndexForm(false)
      setSelectedBlockShiftId(null)
      setNotification({ type: 'success', message: 'Index created successfully!' })
      fetchBlockShifts(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const handleEditIndex = async (id: number, indexData: { startIndex: number; endIndex: number } | Omit<Index, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`/api/v1/indexes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(indexData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update index')
      }

      setEditingIndex(null)
      setShowIndexForm(false)
      setNotification({ type: 'success', message: 'Index updated successfully!' })
      fetchBlockShifts(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const handleDeleteIndex = async (id: number) => {
    if (!confirm('Are you sure you want to delete this index?')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/indexes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete index')
      }

      setNotification({ type: 'success', message: 'Index deleted successfully!' })
      fetchBlockShifts(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const openAddIndexForm = (blockShiftId: number) => {
    setSelectedBlockShiftId(blockShiftId)
    setEditingIndex(null)
    setShowIndexForm(true)
  }

  const openEditIndexForm = (index: Index) => {
    setEditingIndex(index)
    setSelectedBlockShiftId(null)
    setShowIndexForm(true)
  }

  const exportToPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Block Shifts Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .total-row { background-color: #e8f4fd; font-weight: bold; }
            .index-table { margin-left: 20px; font-size: 0.9em; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <h1>Block Shifts Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          
          <div class="summary">
            <h3>Summary</h3>
            <p>Total Block Shifts: ${blockShifts.length}</p>
            <p>Total Revenue: ${formatCurrency(blockShifts.reduce((total, blockShift) => {
              return total + (blockShift.indexes?.reduce((sum, index) => {
                const litresSold = Number(index.startIndex) - Number(index.endIndex)
                const unitPrice = Number(index.product?.prices?.saleUnitPrice) || 0
                return sum + (litresSold * unitPrice)
              }, 0) || 0)
            }, 0))}</p>
          </div>

          ${blockShifts.map(blockShift => {
            const totalRevenue = blockShift.indexes?.reduce((sum, index) => {
              const litresSold = Number(index.startIndex) - Number(index.endIndex)
              const unitPrice = Number(index.product?.prices?.saleUnitPrice) || 0
              return sum + (litresSold * unitPrice)
            }, 0) || 0

            return `
              <h3>Block Shift #${blockShift.id}</h3>
              <table>
                <tr><th>Block</th><td>${blockShift.block?.name || `Block ${blockShift.blockId}`}</td></tr>
                <tr><th>Shift</th><td>${blockShift.shift?.name || `Shift ${blockShift.shiftId}`}</td></tr>
                <tr><th>Cashier</th><td>${blockShift.cashier?.name || `Cashier ${blockShift.cashierId}`}</td></tr>
                <tr><th>Date</th><td>${new Date(blockShift.date).toLocaleDateString()}</td></tr>
                <tr><th>Total Revenue</th><td>${formatCurrency(totalRevenue)}</td></tr>
              </table>
              
              ${blockShift.indexes && blockShift.indexes.length > 0 ? `
                <h4>Fuel Readings</h4>
                <table class="index-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Start Index</th>
                      <th>End Index</th>
                      <th>Litres Sold</th>
                      <th>Unit Price</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${blockShift.indexes.map(index => {
                      const litresSold = Number(index.startIndex) - Number(index.endIndex)
                      const unitPrice = Number(index.product?.prices?.saleUnitPrice) || 0
                      const totalPrice = litresSold * unitPrice
                      
                      return `
                        <tr>
                          <td>${index.product?.name || `Product ${index.productId}`}</td>
                          <td>${index.startIndex}</td>
                          <td>${index.endIndex}</td>
                          <td>${formatLitres(litresSold)}</td>
                          <td>${formatCurrency(unitPrice)}</td>
                          <td>${formatCurrency(totalPrice)}</td>
                        </tr>
                      `
                    }).join('')}
                    <tr class="total-row">
                      <td colspan="5">Total Revenue</td>
                      <td>${formatCurrency(totalRevenue)}</td>
                    </tr>
                  </tbody>
                </table>
              ` : '<p>No fuel readings recorded for this shift.</p>'}
            `
          }).join('<hr>')}
          
          <div class="footer">
            <p>Report generated by Gas Station Management System</p>
          </div>
        </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `block-shifts-report-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToExcel = () => {
    const csvContent = [
      // Header row
      ['Block Shift ID', 'Block', 'Shift', 'Cashier', 'Date', 'Product', 'Start Index', 'End Index', 'Litres Sold', 'Unit Price', 'Total Price'],
      // Data rows
      ...blockShifts.flatMap(blockShift => {
        if (blockShift.indexes && blockShift.indexes.length > 0) {
          return blockShift.indexes.map(index => {
            const litresSold = Number(index.startIndex) - Number(index.endIndex)
                      const unitPrice = Number(index.product?.prices?.saleUnitPrice) || 0
            const totalPrice = litresSold * unitPrice
            
            return [
              blockShift.id,
              blockShift.block?.name || `Block ${blockShift.blockId}`,
              blockShift.shift?.name || `Shift ${blockShift.shiftId}`,
              blockShift.cashier?.name || `Cashier ${blockShift.cashierId}`,
              new Date(blockShift.date).toLocaleDateString(),
              index.product?.name || `Product ${index.productId}`,
              index.startIndex,
              index.endIndex,
              litresSold.toFixed(1),
              unitPrice.toFixed(2),
              totalPrice.toFixed(2)
            ]
          })
        } else {
          return [[
            blockShift.id,
            blockShift.block?.name || `Block ${blockShift.blockId}`,
            blockShift.shift?.name || `Shift ${blockShift.shiftId}`,
            blockShift.cashier?.name || `Cashier ${blockShift.cashierId}`,
            new Date(blockShift.date).toLocaleDateString(),
            'No readings',
            '',
            '',
            '',
            '',
            ''
          ]]
        }
      })
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `block-shifts-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      key: 'expand',
      label: '',
      render: (blockShift: BlockShift) => (
        <button
          onClick={() => toggleRowExpansion(blockShift.id)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {expandedRows.has(blockShift.id) ? (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      )
    },
    {
      key: 'block',
      label: 'Block',
      render: (blockShift: BlockShift) => (
        <div className="font-medium text-gray-900">
          {blockShift.block?.name || `Block ${blockShift.blockId}`}
        </div>
      )
    },
    {
      key: 'shift',
      label: 'Shift',
      render: (blockShift: BlockShift) => (
        <div className="text-gray-600">
          {blockShift.shift?.name || `Shift ${blockShift.shiftId}`}
        </div>
      )
    },
    {
      key: 'cashier',
      label: 'Cashier',
      render: (blockShift: BlockShift) => (
        <div className="text-gray-600">
          {blockShift.cashier?.name || `Cashier ${blockShift.cashierId}`}
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (blockShift: BlockShift) => (
        <div className="text-gray-600">{formatDate(blockShift.date)}</div>
      )
    },
    {
      key: 'indexes',
      label: 'Indexes & Litres',
      render: (blockShift: BlockShift) => (
        <div className="text-sm text-gray-500">
          {blockShift.indexes && blockShift.indexes.length > 0 
            ? `${blockShift.indexes.length} reading(s) - Click to expand`
            : 'No readings - Click to add'
          }
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading block shifts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Block Shifts</h1>
          <p className="text-gray-600">Manage block shift assignments and readings</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToPDF}
            className="btn btn-warning text-sm px-4 py-2 flex items-center"
            title="Export to PDF"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="btn btn-success text-sm px-4 py-2 flex items-center"
            title="Export to Excel"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary text-sm px-4 py-2 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Block Shift
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date Range</h3>
        
        <div className="flex flex-wrap gap-4 items-end">
          {/* Date Range Filter */}
          <div className="flex space-x-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={dateRangeFilter.start}
                onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
                className="form-input text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={dateRangeFilter.end}
                onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
                className="form-input text-gray-900"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Apply Filter
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Active Filter Display */}
        {dateRangeFilter.start && dateRangeFilter.end && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md">
            <span className="text-sm text-blue-800">
              Active filter: Date range from {dateRangeFilter.start} to {dateRangeFilter.end}
            </span>
          </div>
        )}
      </div>

      <DataTable
        data={blockShifts}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onPageChange={(page) => fetchBlockShifts(page, pagination.pageSize)}
        onEdit={(blockShift) => setEditingBlockShift(blockShift)}
        onDelete={handleDelete}
        expandedRows={expandedRows}
        renderExpandedContent={(blockShift) => (
          <div className="p-4">
            <div className="flex items-center mb-4">
              {/* <h4 className="text-sm font-semibold text-gray-900">Fuel Readings</h4> */}
              <button
                onClick={() => openAddIndexForm(blockShift.id)}
                className="btn btn-success text-sm px-3 py-1 w-full flex items-center justify-center uppercase"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Index
              </button>
            </div>
            
            {blockShift.indexes && blockShift.indexes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-purple-50/80 to-blue-50/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Start Index
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        End Index
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Litres Sold
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Total Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {blockShift.indexes.map((index: any) => {
                      const litresSold = Number(index.startIndex) - Number(index.endIndex)
                      const unitPrice = Number(index.product?.prices?.saleUnitPrice) || 0
                      const totalPrice = litresSold * unitPrice
                      
                      // Debug logging
                      console.log('Index data:', {
                        productName: index.product?.name,
                        startIndex: index.startIndex,
                        endIndex: index.endIndex,
                        litresSold,
                        unitPrice,
                        totalPrice,
                        pricesObject: index.product?.prices
                      })
                      
                      return (
                        <tr key={index.id} className="hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-blue-50/30 transition-all duration-200">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium">
                              {index.product?.name || `Product ${index.productId}`}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">
                              {index.startIndex}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center">
                              {index.endIndex}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-center">
                              {formatLitres(litresSold)}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-mono bg-blue-50 px-2 py-1 rounded text-center text-blue-700">
                              {formatCurrency(unitPrice)}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded text-center">
                              {formatCurrency(totalPrice)}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => openEditIndexForm(index)}
                                className="text-purple-600 hover:text-white p-1.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                                title="Edit"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteIndex(index.id)}
                                className="text-rose-600 hover:text-white p-1.5 rounded-lg hover:bg-gradient-to-r hover:from-rose-500 hover:to-red-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                                title="Delete"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-purple-100/50 to-blue-100/50 border-t-2 border-purple-200">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                        Total Revenue:
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {/* Unit price column - empty in total row */}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-purple-700 bg-purple-100 rounded text-center">
                        {formatCurrency(blockShift.indexes.reduce((sum: number, index: any) => {
                          const litresSold = Number(index.startIndex) - Number(index.endIndex)
                          const unitPrice = Number(index.product?.prices?.saleUnitPrice) || 0
                          return sum + (litresSold * unitPrice)
                        }, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {/* Actions column - empty in total row */}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No fuel readings recorded</p>
                <p className="text-gray-400 text-sm mt-1">Click "Add Reading" to record fuel consumption</p>
              </div>
            )}
          </div>
        )}
      />

      {showForm && (
        <BlockShiftForm
          blockShift={null}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingBlockShift && (
        <BlockShiftForm
          blockShift={editingBlockShift}
          onSubmit={(data) => handleEdit(editingBlockShift.id, data)}
          onCancel={() => setEditingBlockShift(null)}
        />
      )}

      {showIndexForm && (
        <IndexForm
          blockShiftId={selectedBlockShiftId || editingIndex?.blockShiftId || 0}
          index={editingIndex}
          onSubmit={editingIndex ? (data) => handleEditIndex(editingIndex.id, data) : handleCreateIndex}
          onCancel={() => {
            setShowIndexForm(false)
            setEditingIndex(null)
            setSelectedBlockShiftId(null)
          }}
        />
      )}

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}
