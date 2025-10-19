'use client'

import { useState, useEffect } from 'react'

interface Shift {
  id: number
  name: string
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
}

interface ShiftFormProps {
  shift: Shift | null
  onSubmit: (data: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function ShiftForm({ shift, onSubmit, onCancel }: ShiftFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: ''
  })

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name,
        startTime: new Date(shift.startTime).toTimeString().slice(0, 5),
        endTime: new Date(shift.endTime).toTimeString().slice(0, 5)
      })
    }
  }, [shift])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      startTime: `${formData.startTime}:00`,
      endTime: `${formData.endTime}:00`
    }
    onSubmit(submitData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-slate-500">
          {shift ? 'Edit Shift' : 'Add New Shift'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full text-slate-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Morning Shift, Evening Shift"
            />
          </div>

          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full text-slate-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full text-slate-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {shift ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
