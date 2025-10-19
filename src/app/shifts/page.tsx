'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/DataTable'
import { ShiftForm } from '@/components/ShiftForm'
import { Notification } from '@/components/Notification'

interface Shift {
  id: number
  name: string
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchShifts = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/shifts?page=${page}&pageSize=${pageSize}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch shifts')
      }
      
      const data = await response.json()
      setShifts(data.data)
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
    fetchShifts()
  }, [])

  const handleCreate = async (shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/v1/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shiftData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create shift')
      }

      setShowForm(false)
      setNotification({ type: 'success', message: 'Shift created successfully!' })
      fetchShifts(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const handleEdit = async (id: number, shiftData: Partial<Shift>) => {
    try {
      const response = await fetch(`/api/v1/shifts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shiftData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update shift')
      }

      setEditingShift(null)
      setNotification({ type: 'success', message: 'Shift updated successfully!' })
      fetchShifts(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this shift?')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/shifts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete shift')
      }

      setNotification({ type: 'success', message: 'Shift deleted successfully!' })
      fetchShifts(pagination.page, pagination.pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setNotification({ type: 'error', message: errorMessage })
    }
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      if (isNaN(date.getTime())) return 'Invalid Time'
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return 'Invalid Time'
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (shift: Shift) => (
        <div className="font-medium text-gray-900">{shift.name}</div>
      )
    },
    {
      key: 'startTime',
      label: 'Start Time',
      render: (shift: Shift) => (
        <div className="text-gray-600">{formatTime(shift.startTime)}</div>
      )
    },
    {
      key: 'endTime',
      label: 'End Time',
      render: (shift: Shift) => (
        <div className="text-gray-600">{formatTime(shift.endTime)}</div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (shift: Shift) => (
        <div className="text-gray-600">
          {new Date(shift.createdAt).toLocaleDateString('en-US', {
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
        <div className="text-lg text-gray-600">Loading shifts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shifts</h1>
          <p className="text-gray-600">Manage work shifts and schedules</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Shift
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <DataTable
        data={shifts}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchShifts(page, pagination.pageSize)}
        onEdit={(shift) => setEditingShift(shift)}
        onDelete={handleDelete}
      />

      {showForm && (
        <ShiftForm
          shift={null}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingShift && (
        <ShiftForm
          shift={editingShift}
          onSubmit={(data) => handleEdit(editingShift.id, data)}
          onCancel={() => setEditingShift(null)}
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
