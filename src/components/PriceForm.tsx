'use client'

import { useState, useEffect } from 'react'

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
}

interface PriceFormProps {
  price: Price | null
  availableProducts?: Product[]
  onSubmit: (data: { productId: number; saleUnitPrice: number } | { saleUnitPrice: number }) => void
  onCancel: () => void
}

export function PriceForm({ price, availableProducts, onSubmit, onCancel }: PriceFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    productId: 0,
    saleUnitPrice: 0
  })

  useEffect(() => {
    if (availableProducts) {
      setProducts(availableProducts)
    } else {
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
    }
  }, [availableProducts])

  useEffect(() => {
    if (price) {
      setFormData({
        productId: price.productId,
        saleUnitPrice: price.saleUnitPrice
      })
    } else {
      setFormData({
        productId: products[0]?.id || 0,
        saleUnitPrice: 0
      })
    }
  }, [price, products])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (price) {
      // Editing existing price
      onSubmit({ saleUnitPrice: formData.saleUnitPrice })
    } else {
      // Creating new price
      onSubmit({ productId: formData.productId, saleUnitPrice: formData.saleUnitPrice })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'productId' || name === 'saleUnitPrice' ? Number(value) : value
    }))
  }

  const selectedProduct = products.find(p => p.id === formData.productId)

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-slate-500">
          {price ? 'Edit Price' : 'Add New Price'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!price && (
            <div>
              <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
                Product *
              </label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {price && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <div className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {price.product.name}
                {price.product.description && (
                  <div className="text-sm text-gray-500">{price.product.description}</div>
                )}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="saleUnitPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Sale Unit Price *
            </label>
            <input
              type="number"
              id="saleUnitPrice"
              name="saleUnitPrice"
              value={formData.saleUnitPrice}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
            />
            {selectedProduct && (
              <p className="text-sm text-gray-500 mt-1">
                Product: {selectedProduct.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {price ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}