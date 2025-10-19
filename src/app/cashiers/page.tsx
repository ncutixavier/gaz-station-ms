'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/DataTable'
import { CashierForm } from '@/components/CashierForm'

interface Cashier {
  id: number
  name: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
}

export default function CashiersPage() {
  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCashier, setEditingCashier] = useState<Cashier | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchCashiers = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/cashiers?page=${page}&pageSize=${pageSize}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch cashiers')
      }
      
      const data = await response.json()
      setCashiers(data.data)
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
    fetchCashiers()
  }, [])

  const handleCreate = async (cashierData: Omit<Cashier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/v1/cashiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cashierData),
      })

      if (!response.ok) {
        throw new Error('Failed to create cashier')
      }

      setShowForm(false)
      fetchCashiers(pagination.page, pagination.pageSize)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleEdit = async (id: number, cashierData: Partial<Cashier>) => {
    try {
      const response = await fetch(`/api/v1/cashiers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cashierData),
      })

      if (!response.ok) {
        throw new Error('Failed to update cashier')
      }

      setEditingCashier(null)
      fetchCashiers(pagination.page, pagination.pageSize)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this cashier?')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/cashiers/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete cashier')
      }

      fetchCashiers(pagination.page, pagination.pageSize)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (cashier: Cashier) => (
        <div className="font-medium text-gray-900">{cashier.name}</div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (cashier: Cashier) => (
        <div className="text-gray-600">{cashier.email}</div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (cashier: Cashier) => (
        <div className="text-gray-600">{cashier.phone}</div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (cashier: Cashier) => (
        <div className="text-gray-600">
          {new Date(cashier.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
          })}
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading cashiers...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cashiers</h1>
          <p className="text-gray-600">Manage cashier information and status</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Cashier
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <DataTable
        data={cashiers}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchCashiers(page, pagination.pageSize)}
        onEdit={(cashier) => setEditingCashier(cashier)}
        onDelete={handleDelete}
      />

      {showForm && (
        <CashierForm
          cashier={null}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingCashier && (
        <CashierForm
          cashier={editingCashier}
          onSubmit={(data) => handleEdit(editingCashier.id, data)}
          onCancel={() => setEditingCashier(null)}
        />
      )}
    </div>
  )
}
