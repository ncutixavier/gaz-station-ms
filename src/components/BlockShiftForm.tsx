'use client'

import { useState, useEffect } from 'react'

interface BlockShift {
  id: number
  blockId: number
  shiftId: number
  cashierId: number
  date: string
  createdAt: string
  updatedAt: string
}

interface Block {
  id: number
  name: string
}

interface Shift {
  id: number
  name: string
}

interface Cashier {
  id: number
  name: string
}

interface BlockShiftFormProps {
  blockShift: BlockShift | null
  onSubmit: (data: Omit<BlockShift, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function BlockShiftForm({ blockShift, onSubmit, onCancel }: BlockShiftFormProps) {
  const [formData, setFormData] = useState({
    blockId: 0,
    shiftId: 0,
    cashierId: 0,
    date: new Date().toISOString().split('T')[0]
  })

  const [blocks, setBlocks] = useState<Block[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [cashiers, setCashiers] = useState<Cashier[]>([])

  useEffect(() => {
    if (blockShift) {
      setFormData({
        blockId: blockShift.blockId,
        shiftId: blockShift.shiftId,
        cashierId: blockShift.cashierId,
        date: blockShift.date
      })
    }
  }, [blockShift])

  useEffect(() => {
    // Fetch blocks, shifts, and cashiers for dropdowns
    const fetchData = async () => {
      try {
        const [blocksRes, shiftsRes, cashiersRes] = await Promise.all([
          fetch('/api/v1/blocks'),
          fetch('/api/v1/shifts'),
          fetch('/api/v1/cashiers')
        ])

        if (blocksRes.ok) {
          const blocksData = await blocksRes.json()
          setBlocks(blocksData.data || [])
        }

        if (shiftsRes.ok) {
          const shiftsData = await shiftsRes.json()
          setShifts(shiftsData.data || [])
        }

        if (cashiersRes.ok) {
          const cashiersData = await cashiersRes.json()
          setCashiers(cashiersData.data || [])
        }
      } catch (error) {
        console.error('Error fetching form data:', error)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Id') ? parseInt(value) || 0 : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-slate-500">
          {blockShift ? 'Edit Block Shift' : 'Add New Block Shift'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="blockId" className="block text-sm font-medium text-gray-700 mb-1">
              Block *
            </label>
            <select
              id="blockId"
              name="blockId"
              value={formData.blockId}
              onChange={handleChange}
              required
              className="w-full text-slate-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 "
            >
              <option value={0}>Select a block</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="shiftId" className="block text-sm font-medium text-gray-700 mb-1">
              Shift *
            </label>
            <select
              id="shiftId"
              name="shiftId"
              value={formData.shiftId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value={0}>Select a shift</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cashierId" className="block text-sm font-medium text-gray-700 mb-1">
              Cashier *
            </label>
            <select
              id="cashierId"
              name="cashierId"
              value={formData.cashierId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value={0}>Select a cashier</option>
              {cashiers.map((cashier) => (
                <option key={cashier.id} value={cashier.id}>
                  {cashier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              {blockShift ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
