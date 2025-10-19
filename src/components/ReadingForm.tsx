'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface Product {
  id: number
  name: string
  unitPrice: number
}

interface BlockShift {
  id: number
  date: string
  block: {
    id: number
    name: string
  }
  shift: {
    id: number
    name: string
  }
  cashier: {
    id: number
    name: string
  }
}

interface Reading {
  id: number
  blockShiftId: number
  productId: number
  startIndex: number
  endIndex: number
  product: Product
  blockShift: BlockShift
}

interface ReadingFormProps {
  reading?: Reading | null
  onSubmit: (data: { blockShiftId: number; productId: number; startIndex: number; endIndex: number }) => void
  onCancel: () => void
}

export function ReadingForm({ reading, onSubmit, onCancel }: ReadingFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [blockShifts, setBlockShifts] = useState<BlockShift[]>([])
  const [formData, setFormData] = useState({
    blockShiftId: reading?.blockShiftId || 0,
    productId: reading?.productId || 0,
    startIndex: reading?.startIndex || 0,
    endIndex: reading?.endIndex || 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, blockShiftsRes] = await Promise.all([
          fetch('/api/v1/products?page=1&pageSize=100'),
          fetch('/api/v1/block-shifts?page=1&pageSize=100')
        ])
        
        const [productsData, blockShiftsData] = await Promise.all([
          productsRes.json(),
          blockShiftsRes.json()
        ])
        
        setProducts(productsData.data || [])
        setBlockShifts(blockShiftsData.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.blockShiftId) {
      newErrors.blockShiftId = 'Please select a block shift'
    }
    
    if (!formData.productId) {
      newErrors.productId = 'Please select a product'
    }
    
    if (formData.startIndex < 0) {
      newErrors.startIndex = 'Start index cannot be negative'
    }
    
    if (formData.endIndex < 0) {
      newErrors.endIndex = 'End index cannot be negative'
    }
    
    if (formData.endIndex > formData.startIndex) {
      newErrors.endIndex = 'End index cannot be greater than start index'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      setLoading(true)
      try {
        await onSubmit(formData)
      } finally {
        setLoading(false)
      }
    }
  }

  const calculateLitresSold = () => {
    if (formData.startIndex > 0 && formData.endIndex >= 0) {
      return formData.startIndex - formData.endIndex
    }
    return 0
  }

  const getSelectedProduct = () => {
    return products.find(p => p.id === formData.productId)
  }

  const calculateRevenue = () => {
    const product = getSelectedProduct()
    if (product) {
      return calculateLitresSold() * product.unitPrice
    }
    return 0
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-500">
            {reading ? 'Edit Reading' : 'Record New Reading'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="blockShiftId" className="block text-sm font-medium text-gray-700 mb-1">
              Block & Shift
            </label>
            <select
              id="blockShiftId"
              value={formData.blockShiftId}
              onChange={(e) => setFormData({ ...formData, blockShiftId: parseInt(e.target.value) })}
              disabled={!!reading}
              className={`w-full text-slate-500 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.blockShiftId ? 'border-red-500' : 'border-gray-300'
              } ${reading ? 'bg-gray-100' : ''}`}
            >
              <option value={0}>Select block shift</option>
              {blockShifts.map((blockShift) => (
                <option key={blockShift.id} value={blockShift.id}>
                  {blockShift.block.name} - {blockShift.shift.name} ({new Date(blockShift.date).toLocaleDateString()})
                </option>
              ))}
            </select>
            {errors.blockShiftId && (
              <p className="text-red-500 text-sm mt-1">{errors.blockShiftId}</p>
            )}
          </div>

          <div>
            <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              id="productId"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: parseInt(e.target.value) })}
              disabled={!!reading}
              className={`w-full text-slate-500 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.productId ? 'border-red-500' : 'border-gray-300'
              } ${reading ? 'bg-gray-100' : ''}`}
            >
              <option value={0}>Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.unitPrice}/L
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
            )}
          </div>

          <div>
            <label htmlFor="startIndex" className="block text-sm font-medium text-gray-700 mb-1">
              Start Index (Liters)
            </label>
            <input
              type="number"
              id="startIndex"
              min="0"
              step="0.1"
              value={formData.startIndex}
              onChange={(e) => setFormData({ ...formData, startIndex: parseFloat(e.target.value) || 0 })}
              className={`w-full text-slate-500 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startIndex ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.0"
            />
            {errors.startIndex && (
              <p className="text-red-500 text-sm mt-1">{errors.startIndex}</p>
            )}
          </div>

          <div>
            <label htmlFor="endIndex" className="block text-sm font-medium text-gray-700 mb-1">
              End Index (Liters)
            </label>
            <input
              type="number"
              id="endIndex"
              min="0"
              step="0.1"
              value={formData.endIndex}
              onChange={(e) => setFormData({ ...formData, endIndex: parseFloat(e.target.value) || 0 })}
              className={`w-full text-slate-500 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endIndex ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.0"
            />
            {errors.endIndex && (
              <p className="text-red-500 text-sm mt-1">{errors.endIndex}</p>
            )}
          </div>

          {formData.startIndex > 0 && formData.endIndex >= 0 && getSelectedProduct() && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Calculation Preview</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Litres Sold:</span>
                  <span className="font-medium text-green-600">{calculateLitresSold()} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium text-green-600">${calculateRevenue()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (reading ? 'Update Reading' : 'Record Reading')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
