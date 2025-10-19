'use client'

import { useState, useEffect } from 'react'

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
}

interface StockRecordFormProps {
  stockRecord: StockRecord | null
  onSubmit: (data: Omit<StockRecord, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function StockRecordForm({ stockRecord, onSubmit, onCancel }: StockRecordFormProps) {
  const [formData, setFormData] = useState({
    productId: 0,
    quantity: 0,
    recordDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (stockRecord) {
      setFormData({
        productId: stockRecord.productId,
        quantity: stockRecord.quantity,
        recordDate: stockRecord.recordDate.split('T')[0],
        notes: stockRecord.notes || ''
      })
    }
  }, [stockRecord])

  useEffect(() => {
    // Fetch products for the dropdown
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/v1/products')
        
        if (response.ok) {
          const data = await response.json()
          setProducts(data.data)
        } else {
          console.error('Failed to fetch products:', response.status)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validation
    if (formData.productId === 0) {
      setError('Please select a product')
      setLoading(false)
      return
    }

    if (formData.quantity <= 0) {
      setError('Please enter a quantity greater than 0')
      setLoading(false)
      return
    }

    if (!formData.recordDate) {
      setError('Please select a record date')
      setLoading(false)
      return
    }

    try {
      await onSubmit({
        productId: formData.productId,
        quantity: formData.quantity,
        recordDate: formData.recordDate,
        notes: formData.notes || null
      })
    } catch (error) {
      setError('Failed to create stock record. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'productId' ? parseInt(value) || 0 : 
              name === 'quantity' ? parseFloat(value) || 0 : value
    }))
  }

  const selectedProduct = products.find(p => p.id === formData.productId)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md slide-up">
        <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 rounded-t-2xl p-6 text-white">
          <h2 className="text-xl font-bold flex items-center">
            <span className="text-2xl mr-2">📦</span>
            {stockRecord ? 'Edit Stock Record' : 'Add Stock Record'}
          </h2>
          <p className="text-purple-100 text-sm mt-1">
            {stockRecord ? 'Update daily stock quantity' : 'Record daily stock quantity'}
          </p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="productId" className="form-label">
                Product *
              </label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
                className="form-input"
                disabled={loading}
              >
                <option value={0}>Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedProduct.description || 'No description available'}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="recordDate" className="form-label">
                Record Date *
              </label>
              <input
                type="date"
                id="recordDate"
                name="recordDate"
                value={formData.recordDate}
                onChange={handleChange}
                required
                className="form-input"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                Date for this stock record
              </p>
            </div>

            <div>
              <label htmlFor="quantity" className="form-label">
                Quantity (Litres) *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="form-input"
                placeholder="Enter stock quantity"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                Current stock quantity in litres
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="form-label">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="form-input"
                placeholder="Add any additional notes..."
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                Optional notes about this stock record
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : (stockRecord ? 'Update Record' : 'Create Record')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
