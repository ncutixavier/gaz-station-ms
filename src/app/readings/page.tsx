'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, CalculatorIcon } from '@heroicons/react/24/outline'
import { ReadingForm } from '@/components/ReadingForm'
import { DataTable } from '@/components/DataTable'

interface Reading {
  id: number
  blockShiftId: number
  productId: number
  startIndex: number
  endIndex: number
  createdAt: string
  product: {
    id: number
    name: string
    unitPrice: number
  }
  blockShift: {
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
}

interface PaginatedResponse {
  data: Reading[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function ReadingsPage() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReading, setEditingReading] = useState<Reading | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchReadings = async (page = 1, pageSize = 20) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/readings?page=${page}&pageSize=${pageSize}`)
      const data: PaginatedResponse = await response.json()
      
      setReadings(data.data)
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev
      })
    } catch (error) {
      console.error('Error fetching readings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReadings()
  }, [])

  const handleCreate = async (readingData: { blockShiftId: number; productId: number; startIndex: number; endIndex: number }) => {
    try {
      const response = await fetch('/api/v1/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readingData)
      })
      
      if (response.ok) {
        setShowForm(false)
        fetchReadings(pagination.page, pagination.pageSize)
      }
    } catch (error) {
      console.error('Error creating reading:', error)
    }
  }

  const handleUpdate = async (id: number, readingData: { startIndex: number; endIndex: number }) => {
    try {
      const response = await fetch(`/api/v1/readings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readingData)
      })
      
      if (response.ok) {
        setEditingReading(null)
        fetchReadings(pagination.page, pagination.pageSize)
      }
    } catch (error) {
      console.error('Error updating reading:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reading?')) return
    
    try {
      const response = await fetch(`/api/v1/readings/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchReadings(pagination.page, pagination.pageSize)
      }
    } catch (error) {
      console.error('Error deleting reading:', error)
    }
  }

  const calculateLitresSold = (startIndex: number, endIndex: number) => {
    return startIndex - endIndex
  }

  const calculateRevenue = (startIndex: number, endIndex: number, unitPrice: number) => {
    const litresSold = calculateLitresSold(startIndex, endIndex)
    return litresSold * unitPrice
  }

  const columns = [
    {
      key: 'blockShift',
      label: 'Block & Shift',
      render: (reading: Reading) => (
        <div>
          <div className="font-medium text-gray-900">{reading.blockShift.block.name}</div>
          <div className="text-sm text-gray-500">{reading.blockShift.shift.name}</div>
          <div className="text-xs text-gray-400">
            {new Date(reading.blockShift.date).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'product',
      label: 'Product',
      render: (reading: Reading) => (
        <div>
          <div className="font-medium text-gray-900">{reading.product.name}</div>
          <div className="text-sm text-gray-500">${reading.product.unitPrice}/L</div>
        </div>
      )
    },
    {
      key: 'readings',
      label: 'Pump Readings',
      render: (reading: Reading) => (
        <div className="text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Start:</span>
            <span className="font-medium">{reading.startIndex} L</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">End:</span>
            <span className="font-medium">{reading.endIndex} L</span>
          </div>
        </div>
      )
    },
    {
      key: 'sales',
      label: 'Sales',
      render: (reading: Reading) => {
        const litresSold = calculateLitresSold(reading.startIndex, reading.endIndex)
        const revenue = calculateRevenue(reading.startIndex, reading.endIndex, reading.product.unitPrice)
        
        return (
          <div className="text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Litres:</span>
              <span className="font-medium text-green-600">{litresSold} L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Revenue:</span>
              <span className="font-medium text-green-600">${revenue}</span>
            </div>
          </div>
        )
      }
    },
    {
      key: 'cashier',
      label: 'Cashier',
      render: (reading: Reading) => (
        <div className="text-sm text-gray-900">
          {reading.blockShift.cashier.name}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Recorded',
      render: (reading: Reading) => (
        <div className="text-sm text-gray-500">
          {new Date(reading.createdAt).toLocaleString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (reading: Reading) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingReading(reading)}
            className="text-blue-600 hover:text-blue-900"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(reading.id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const totalLitresSold = readings.reduce((sum, reading) => {
    return sum + calculateLitresSold(reading.startIndex, reading.endIndex)
  }, 0)

  const totalRevenue = readings.reduce((sum, reading) => {
    return sum + calculateRevenue(reading.startIndex, reading.endIndex, reading.product.unitPrice)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pump Readings</h1>
          <p className="text-gray-600 mt-2">Record and manage pump index readings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Record Reading</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <CalculatorIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Litres Sold</p>
              <p className="text-2xl font-bold text-green-600">{totalLitresSold} L</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <CalculatorIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">${totalRevenue}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <CalculatorIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Readings</p>
              <p className="text-2xl font-bold text-purple-600">{readings.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={readings}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => fetchReadings(page, pagination.pageSize)}
        />
      </div>

      {showForm && (
        <ReadingForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingReading && (
        <ReadingForm
          reading={editingReading}
          onSubmit={(data) => handleUpdate(editingReading.id, data)}
          onCancel={() => setEditingReading(null)}
        />
      )}
    </div>
  )
}
