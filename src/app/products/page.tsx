'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { ProductForm } from '@/components/ProductForm'
import { DataTable } from '@/components/DataTable'

interface Product {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

interface PaginatedResponse {
  data: Product[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchProducts = async (page = 1, pageSize = 20) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/products?page=${page}&pageSize=${pageSize}`)
      const data: PaginatedResponse = await response.json()
      
      setProducts(data.data)
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev
      })
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleCreate = async (productData: { name: string; description?: string }) => {
    try {
      const response = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      if (response.ok) {
        setShowForm(false)
        fetchProducts(pagination.page, pagination.pageSize)
      }
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleUpdate = async (id: number, productData: { name: string; description?: string }) => {
    try {
      const response = await fetch(`/api/v1/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      if (response.ok) {
        setEditingProduct(null)
        fetchProducts(pagination.page, pagination.pageSize)
      }
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const response = await fetch(`/api/v1/products/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchProducts(pagination.page, pagination.pageSize)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Product Name',
      render: (product: Product) => (
        <div className="font-medium text-gray-900">{product.name}</div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (product: Product) => (
        <div className="text-gray-600">
          {product.description || <span className="text-gray-400 italic">No description</span>}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (product: Product) => (
        <div className="text-gray-500">
          {new Date(product.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product: Product) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingProduct(product)}
            className="text-blue-600 hover:text-blue-900"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(product.id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage fuel products and pricing</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={products}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => fetchProducts(page, pagination.pageSize)}
        />
      </div>

      {showForm && (
        <ProductForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSubmit={(data) => handleUpdate(editingProduct.id, data)}
          onCancel={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}
