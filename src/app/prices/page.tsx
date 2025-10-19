'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/DataTable'
import { PriceForm } from '@/components/PriceForm'
import { Notification } from '@/components/Notification'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

interface Price {
  id: number
  productId: number
  saleUnitPrice: number
  createdAt: string
  updatedAt: string
  product: Product
  priceHistory: PriceHistory[]
}

interface PriceHistory {
  id: number
  priceId: number
  oldPrice: number | null
  newPrice: number
  changeDate: string
  createdAt: string
}

export default function PricesPage() {
  const [prices, setPrices] = useState<Price[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPrice, setEditingPrice] = useState<Price | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedPriceHistory, setSelectedPriceHistory] = useState<PriceHistory[]>([])
  const [selectedProductName, setSelectedProductName] = useState<string>('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/v1/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchPrices = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/prices?page=${page}&pageSize=${pageSize}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices')
      }
      
      const data = await response.json()
      setPrices(data.data)
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

  const fetchPriceHistory = async (productId: number, productName: string) => {
    try {
      const response = await fetch(`/api/v1/price-history?productId=${productId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch price history')
      }
      
      const data = await response.json()
      setSelectedPriceHistory(data.data)
      setSelectedProductName(productName)
      setShowHistoryModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const exportToPDF = () => {
    const content = `
      <html>
        <head>
          <title>Price History - ${selectedProductName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .increase { color: #dc3545; }
            .decrease { color: #28a745; }
            .initial { color: #007bff; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Price History - ${selectedProductName}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Change Type</th>
                <th>Old Price</th>
                <th>New Price</th>
                <th>Change Amount</th>
                <th>Change %</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${selectedPriceHistory.map(history => {
                const changeType = history.oldPrice === null ? 'Initial Price' : 
                                 history.newPrice > history.oldPrice ? 'Price Increase' : 'Price Decrease'
                const changeAmount = history.oldPrice ? (history.newPrice - history.oldPrice).toFixed(2) : 'N/A'
                const changePercent = history.oldPrice ? 
                  (((history.newPrice - history.oldPrice) / history.oldPrice) * 100).toFixed(1) + '%' : 'N/A'
                const changeClass = history.oldPrice === null ? 'initial' : 
                                  history.newPrice > history.oldPrice ? 'increase' : 'decrease'
                
                return `
                  <tr>
                    <td class="${changeClass}">${changeType}</td>
                    <td>${history.oldPrice ? formatCurrency(history.oldPrice) : 'N/A'}</td>
                    <td>${formatCurrency(history.newPrice)}</td>
                    <td class="${changeClass}">${changeAmount !== 'N/A' ? formatCurrency(changeAmount) : changeAmount}</td>
                    <td class="${changeClass}">${changePercent}</td>
                    <td>${new Date(history.changeDate).toLocaleString()}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Total Changes: ${selectedPriceHistory.length}</p>
            <p>Report generated by Gas Station Management System</p>
          </div>
        </body>
      </html>
    `
    
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `price-history-${selectedProductName.replace(/[^a-zA-Z0-9]/g, '-')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToExcel = () => {
    const csvContent = [
      ['Change Type', 'Old Price', 'New Price', 'Change Amount', 'Change %', 'Date'],
      ...selectedPriceHistory.map(history => {
        const changeType = history.oldPrice === null ? 'Initial Price' : 
                          history.newPrice > history.oldPrice ? 'Price Increase' : 'Price Decrease'
        const changeAmount = history.oldPrice ? (history.newPrice - history.oldPrice).toFixed(2) : 'N/A'
        const changePercent = history.oldPrice ? 
          (((history.newPrice - history.oldPrice) / history.oldPrice) * 100).toFixed(1) + '%' : 'N/A'
        
        return [
          changeType,
          history.oldPrice ? formatCurrency(history.oldPrice) : 'N/A',
          formatCurrency(history.newPrice),
          changeAmount !== 'N/A' ? formatCurrency(changeAmount) : changeAmount,
          changePercent,
          new Date(history.changeDate).toLocaleString()
        ]
      })
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `price-history-${selectedProductName.replace(/[^a-zA-Z0-9]/g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchProducts()
    fetchPrices()
  }, [])

  const handleCreate = async (priceData: { productId: number; saleUnitPrice: number } | { saleUnitPrice: number }) => {
    try {
      const response = await fetch('/api/v1/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priceData as { productId: number; saleUnitPrice: number }),
      })

      if (!response.ok) {
        throw new Error('Failed to create price')
      }

      setShowForm(false)
      setNotification({ type: 'success', message: 'Price created successfully!' })
      fetchPrices(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const handleEdit = async (id: number, priceData: { saleUnitPrice: number }) => {
    try {
      const response = await fetch(`/api/v1/prices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priceData),
      })

      if (!response.ok) {
        throw new Error('Failed to update price')
      }

      setEditingPrice(null)
      setNotification({ type: 'success', message: 'Price updated successfully!' })
      fetchPrices(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this price?')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/prices/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete price')
      }

      setNotification({ type: 'success', message: 'Price deleted successfully!' })
      fetchPrices(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const getPriceChangeType = (oldPrice: number | null, newPrice: number) => {
    if (oldPrice === null) return 'initial'
    if (newPrice > oldPrice) return 'increase'
    if (newPrice < oldPrice) return 'decrease'
    return 'no-change'
  }

  const getPriceChangeColor = (oldPrice: number | null, newPrice: number) => {
    const changeType = getPriceChangeType(oldPrice, newPrice)
    switch (changeType) {
      case 'increase': return 'text-red-600'
      case 'decrease': return 'text-green-600'
      case 'initial': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getPriceChangeIcon = (oldPrice: number | null, newPrice: number) => {
    const changeType = getPriceChangeType(oldPrice, newPrice)
    switch (changeType) {
      case 'increase': return '↗'
      case 'decrease': return '↘'
      case 'initial': return '●'
      default: return '→'
    }
  }

  // Check which products don't have prices yet
  const productsWithoutPrices = products.filter(product => 
    !prices.some(price => price.productId === product.id)
  )

  const canAddPrice = productsWithoutPrices.length > 0

  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (price: Price) => (
        <div>
          <div className="font-medium text-gray-900">{price.product.name}</div>
          {price.product.description && (
            <div className="text-sm text-gray-500">{price.product.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'currentPrice',
      label: 'Current Price',
      render: (price: Price) => (
        <div className="text-lg font-semibold text-blue-600">
          {formatCurrency(price.saleUnitPrice)}
        </div>
      )
    },
    {
      key: 'priceHistory',
      label: 'Recent Changes',
      render: (price: Price) => (
        <div className="space-y-1">
          {price.priceHistory.slice(0, 3).map((history, index) => (
            <div key={history.id} className="flex items-center space-x-2 text-sm">
              {history.oldPrice !== null && (
                <span className="text-gray-500">{formatCurrency(history.oldPrice)}</span>
              )}
              <span className={`font-medium ${getPriceChangeColor(history.oldPrice, history.newPrice)}`}>
                {getPriceChangeIcon(history.oldPrice, history.newPrice)} {formatCurrency(history.newPrice)}
              </span>
              <span className="text-gray-400">
                {new Date(history.changeDate).toLocaleDateString()}
              </span>
            </div>
          ))}
          {price.priceHistory.length === 0 && (
            <div className="text-gray-400 text-sm">No history</div>
          )}
        </div>
      )
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      render: (price: Price) => (
        <div className="text-gray-600">
          {new Date(price.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
          })}
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (price: Price) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchPriceHistory(price.productId, price.product.name)}
            className="text-blue-600 hover:text-blue-900 px-3 py-1 text-sm border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
          >
            View History
          </button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading prices...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Prices</h1>
          <p className="text-gray-600">Manage product pricing and view price history</p>
          {!canAddPrice && products.length > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              All products have prices. Create a new product to add more prices.
            </p>
          )}
        </div>
        {canAddPrice && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Price
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <DataTable
        data={prices}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchPrices(page, pagination.pageSize)}
        onEdit={(price) => setEditingPrice(price)}
        onDelete={handleDelete}
      />

      {showForm && (
        <PriceForm
          price={null}
          availableProducts={productsWithoutPrices}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingPrice && (
        <PriceForm
          price={editingPrice}
          onSubmit={(data) => handleEdit(editingPrice.id, data)}
          onCancel={() => setEditingPrice(null)}
        />
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Price History - {selectedProductName}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportToPDF}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  title="Export to PDF"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>PDF</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  title="Export to Excel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {selectedPriceHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No price history available for this product.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPriceHistory.map((history, index) => (
                    <div key={history.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            history.oldPrice === null ? 'bg-blue-500' :
                            history.newPrice > history.oldPrice ? 'bg-red-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {history.oldPrice === null ? 'Initial Price' : 
                               history.newPrice > history.oldPrice ? 'Price Increase' : 'Price Decrease'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(history.changeDate).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'UTC'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {history.oldPrice !== null && (
                            <div className="text-sm text-gray-500">
                              From: {formatCurrency(history.oldPrice)}
                            </div>
                          )}
                          <div className="font-semibold text-gray-900">
                            To: {formatCurrency(history.newPrice)}
                          </div>
                          {history.oldPrice !== null && (
                            <div className={`text-sm ${
                              history.newPrice > history.oldPrice ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {history.newPrice > history.oldPrice ? '+' : ''}
                              {formatCurrency(history.newPrice - history.oldPrice)} (
                              {(((history.newPrice - history.oldPrice) / history.oldPrice) * 100).toFixed(1)}%)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
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