'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/DataTable'
import { StockRecordForm } from '@/components/StockRecordForm'
import { StockCards } from '@/components/StockCards'
import { Notification } from '@/components/Notification'
import { formatNumber } from '@/lib/utils'

interface Product {
  id: number
  name: string
  description: string | null
}

interface StockRecord {
  id: number
  productId: number
  quantity: number
  recordDate: string
  notes: string | null
  createdAt: string
  updatedAt: string
  product: Product
}

interface Stock {
  id: number
  productId: number
  quantity: number
  updatedAt: string
  product: Product
}

interface NotificationState {
  type: 'success' | 'error'
  message: string
}

export default function StockPage() {
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([])
  const [currentStocks, setCurrentStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [stocksLoading, setStocksLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingStockRecord, setEditingStockRecord] = useState<StockRecord | null>(null)
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [notification, setNotification] = useState<NotificationState | null>(null)
  
  // Filter states
  const [dateFilter, setDateFilter] = useState({
    date: '',
    startDate: '',
    endDate: '',
    productId: ''
  })

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchCurrentStocks = async () => {
    try {
      setStocksLoading(true)
      const response = await fetch('/api/v1/stock')
      
      if (!response.ok) {
        throw new Error('Failed to fetch current stocks')
      }
      
      const data = await response.json()
      setCurrentStocks(data.data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    } finally {
      setStocksLoading(false)
    }
  }

  const fetchStockRecords = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true)
      let url = `/api/v1/stock-records?page=${page}&pageSize=${pageSize}`
      
      // Add filters
      if (dateFilter.date) {
        url += `&date=${dateFilter.date}`
      }
      if (dateFilter.startDate && dateFilter.endDate) {
        url += `&startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`
      }
      if (dateFilter.productId) {
        url += `&productId=${dateFilter.productId}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock records')
      }
      
      const data = await response.json()
      setStockRecords(data.data)
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentStocks()
    fetchStockRecords()
  }, [])

  const handleCreate = async (stockRecordData: Omit<StockRecord, 'id' | 'createdAt' | 'updatedAt' | 'product'>) => {
    try {
      const response = await fetch('/api/v1/stock-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockRecordData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create stock record')
      }

      setNotification({ type: 'success', message: 'Stock record created successfully' })
      fetchStockRecords(pagination.page, pagination.pageSize)
      setShowForm(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create stock record'
      setNotification({ type: 'error', message: errorMessage })
      throw error // Re-throw so the form can handle it
    }
  }

  const handleEdit = async (id: number, stockRecordData: Partial<StockRecord>) => {
    try {
      const response = await fetch(`/api/v1/stock-records/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockRecordData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update stock record')
      }

      setNotification({ type: 'success', message: 'Stock record updated successfully' })
      fetchStockRecords(pagination.page, pagination.pageSize)
      setEditingStockRecord(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update stock record'
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this stock record?')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/stock-records/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete stock record')
      }

      setNotification({ type: 'success', message: 'Stock record deleted successfully' })
      fetchStockRecords(pagination.page, pagination.pageSize)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete stock record'
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const handleStockEdit = async (id: number, stockData: Partial<Stock>) => {
    try {
      const response = await fetch(`/api/v1/stock/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update stock')
      }

      setNotification({ type: 'success', message: 'Stock updated successfully' })
      fetchCurrentStocks()
      setEditingStock(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update stock'
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const applyFilters = () => {
    fetchStockRecords(1, pagination.pageSize)
  }

  const clearFilters = () => {
    setDateFilter({
      date: '',
      startDate: '',
      endDate: '',
      productId: ''
    })
    fetchStockRecords(1, pagination.pageSize)
  }

  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (stockRecord: StockRecord) => (
        <div>
          <div className="font-medium text-gray-900">
            {stockRecord.product.name}
          </div>
          {stockRecord.product.description && (
            <div className="text-sm text-gray-500">
              {stockRecord.product.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'recordDate',
      label: 'Record Date',
      render: (stockRecord: StockRecord) => (
        <div className="text-gray-900">
          {new Date(stockRecord.recordDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity (L)',
      render: (stockRecord: StockRecord) => (
        <div className="font-mono bg-emerald-50 px-3 py-1 rounded text-center text-emerald-700 font-semibold">
          {formatNumber(stockRecord.quantity, 1)}L
        </div>
      )
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (stockRecord: StockRecord) => (
        <div className="text-gray-600 max-w-xs truncate">
          {stockRecord.notes || '-'}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (stockRecord: StockRecord) => (
        <div className="text-sm text-gray-500">
          {new Date(stockRecord.createdAt).toLocaleDateString()}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600">Track daily stock quantities for all products</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary text-sm px-4 py-2 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Stock Record
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Current Stock Cards Slider */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Current Stock Levels</h2>
            <p className="text-sm text-gray-600">Quick overview of all product stock quantities</p>
          </div>
          <div className="text-sm text-gray-500">
            {currentStocks.length} products
          </div>
        </div>
        
        <StockCards
          stocks={currentStocks}
          loading={stocksLoading}
          onEdit={setEditingStock}
        />
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Stock Records</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Single Date Filter */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Specific Date
            </label>
            <input
              type="date"
              id="date"
              value={dateFilter.date}
              onChange={(e) => setDateFilter(prev => ({ ...prev, date: e.target.value, startDate: '', endDate: '' }))}
              className="form-input text-gray-900"
            />
          </div>

          {/* Date Range Filter */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value, date: '' }))}
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
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value, date: '' }))}
              className="form-input text-gray-900"
            />
          </div>

          {/* Product Filter */}
          <div>
            <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              id="productId"
              value={dateFilter.productId}
              onChange={(e) => setDateFilter(prev => ({ ...prev, productId: e.target.value }))}
              className="form-input text-gray-900"
            >
              <option value="">All Products</option>
              {stockRecords.map(record => (
                <option key={record.product.id} value={record.product.id}>
                  {record.product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={applyFilters}
            className="btn btn-primary text-sm px-4 py-2"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="btn btn-secondary text-sm px-4 py-2"
          >
            Clear Filters
          </button>
        </div>

        {/* Active Filter Display */}
        {(dateFilter.date || (dateFilter.startDate && dateFilter.endDate) || dateFilter.productId) && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md">
            <span className="text-sm text-blue-800">
              Active filters: 
              {dateFilter.date && ` Date: ${dateFilter.date}`}
              {dateFilter.startDate && dateFilter.endDate && ` Date range: ${dateFilter.startDate} to ${dateFilter.endDate}`}
              {dateFilter.productId && ` Product: ${stockRecords.find(r => r.product.id.toString() === dateFilter.productId)?.product.name || 'Unknown'}`}
            </span>
          </div>
        )}
      </div>

      <DataTable
        data={stockRecords}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onPageChange={(page) => fetchStockRecords(page, pagination.pageSize)}
        onEdit={(stockRecord) => setEditingStockRecord(stockRecord)}
        onDelete={handleDelete}
      />

      {showForm && (
        <StockRecordForm
          stockRecord={null}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingStockRecord && (
        <StockRecordForm
          stockRecord={editingStockRecord}
          onSubmit={(data) => handleEdit(editingStockRecord.id, data)}
          onCancel={() => setEditingStockRecord(null)}
        />
      )}

      {/* Stock Edit Modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Stock - {editingStock.product.name}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const quantity = parseFloat(formData.get('quantity') as string)
              handleStockEdit(editingStock.id, { quantity })
            }}>
              <div className="mb-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Quantity (L)
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  step="0.1"
                  min="0"
                  defaultValue={Number(editingStock.quantity)}
                  className="form-input text-gray-900 w-full"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Update Stock
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStock(null)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
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