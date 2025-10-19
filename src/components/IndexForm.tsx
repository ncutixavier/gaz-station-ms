'use client'

import { useState, useEffect } from 'react'

interface Index {
  id: number
  blockShiftId: number
  productId: number
  startIndex: number | string
  endIndex: number | string
  createdAt: string
}

interface Product {
  id: number
  name: string
  description: string | null
}

interface IndexFormProps {
  blockShiftId: number
  index: Index | null
  onSubmit: (data: Omit<Index, 'id' | 'createdAt'> | { startIndex: number; endIndex: number }) => void
  onCancel: () => void
}

export function IndexForm({ blockShiftId, index, onSubmit, onCancel }: IndexFormProps) {
  const [formData, setFormData] = useState({
    blockShiftId: blockShiftId,
    productId: 0,
    startIndex: 0,
    endIndex: 0
  })

  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (index) {
      setFormData({
        blockShiftId: index.blockShiftId,
        productId: index.productId,
        startIndex: parseFloat(index.startIndex.toString()),
        endIndex: parseFloat(index.endIndex.toString())
      })
    }
  }, [index])

  useEffect(() => {
    // Fetch products for the dropdown
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

    fetchProducts()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that start index is higher than end index
    if (formData.startIndex <= formData.endIndex) {
      alert('Start index must be higher than end index. Please check your readings.')
      return
    }
    
    if (index) {
      // When editing, only send the fields that can be updated
      onSubmit({
        startIndex: formData.startIndex,
        endIndex: formData.endIndex
      })
    } else {
      // When creating, send all form data
      onSubmit(formData)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Id') || name.includes('Index') ? parseFloat(value) || 0 : value
    }))
  }

  const selectedProduct = products.find(p => p.id === formData.productId)
  const litresSold = formData.startIndex - formData.endIndex
  
  // Check if the current form data is valid
  const isFormDataValid = formData.startIndex > formData.endIndex
  
  // For editing, check if data has actually changed from the original
  const hasDataChanged = index ? (
    formData.startIndex !== index.startIndex || 
    formData.endIndex !== index.endIndex
  ) : true
  
  // Button should be enabled if:
  // 1. For creating: data is valid
  // 2. For editing: data is valid AND has changed from original
  const shouldEnableButton = isFormDataValid && (index ? hasDataChanged : true)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md slide-up">
        <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 rounded-t-2xl p-6 text-white">
          <h2 className="text-xl font-bold flex items-center">
            <span className="text-2xl mr-2">⛽</span>
            {index ? 'Edit Index Reading' : 'Add Index Reading'}
          </h2>
          <p className="text-purple-100 text-sm mt-1">
            {index ? 'Update pump readings for this shift' : 'Record new pump readings'}
          </p>
        </div>
        
        <div className="p-6">
          {index && hasDataChanged && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-3 mb-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse mr-2"></div>
                <p className="text-sm text-purple-800 font-medium">📝 Changes detected - you can now save your updates</p>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="text-sm text-amber-800">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">📊</span>
                <strong>How to read pump indexes:</strong>
              </div>
              <ul className="text-xs space-y-1 ml-6">
                <li>• <strong>Start Index:</strong> Reading on the pump at the beginning of your shift</li>
                <li>• <strong>End Index:</strong> Reading on the pump at the end of your shift</li>
                <li>• <strong>Start Index must be higher than End Index</strong> (pump readings decrease as fuel is sold)</li>
              </ul>
            </div>
          </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="productId" className="form-label">
              Product *
            </label>
            {index ? (
              <div className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 font-medium">
                {selectedProduct?.name || `Product ${formData.productId}`}
              </div>
            ) : (
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value={0}>Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="startIndex" className="form-label">
              Start Index (Beginning of Shift) *
            </label>
            <input
              type="number"
              id="startIndex"
              name="startIndex"
              value={formData.startIndex}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="form-input"
              placeholder="Enter reading at start of shift"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
              Reading on the pump at the beginning of the shift
            </p>
          </div>

          <div>
            <label htmlFor="endIndex" className="form-label">
              End Index (End of Shift) *
            </label>
            <input
              type="number"
              id="endIndex"
              name="endIndex"
              value={formData.endIndex}
              onChange={handleChange}
              required
              max={formData.startIndex || 999999}
              step="0.01"
              className={`form-input ${
                formData.endIndex > 0 && formData.endIndex >= formData.startIndex 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : ''
              }`}
              placeholder="Enter reading at end of shift"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
              Reading on the pump at the end of the shift
            </p>
            {formData.endIndex > 0 && formData.endIndex >= formData.startIndex && (
              <p className="text-xs text-red-600 mt-2 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                ⚠️ Start index should be higher than end index
              </p>
            )}
          </div>

          {formData.endIndex > 0 && formData.startIndex > 0 && (
            <div className={`border-2 rounded-xl p-4 ${
              formData.startIndex > formData.endIndex 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
            }`}>
              <div className={`text-sm font-semibold ${
                formData.startIndex > formData.endIndex ? 'text-green-800' : 'text-red-800'
              }`}>
                <div className="flex items-center">
                  <span className="text-lg mr-2">⛽</span>
                  <strong>Litres Sold:</strong> {
                    formData.startIndex > formData.endIndex 
                      ? `${litresSold.toFixed(2)}L` 
                      : 'Invalid (Start ≤ End)'
                  }
                </div>
              </div>
              {formData.startIndex <= formData.endIndex && (
                <div className="text-xs text-red-600 mt-2 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  Please ensure start reading is higher than end reading
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!shouldEnableButton}
              className={`btn ${
                !shouldEnableButton
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {index ? 'Update Reading' : 'Create Reading'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
