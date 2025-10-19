'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { BlockForm } from '@/components/BlockForm'
import { DataTable } from '@/components/DataTable'

interface Block {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

interface PaginatedResponse {
  data: Block[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchBlocks = async (page = 1, pageSize = 20) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/blocks?page=${page}&pageSize=${pageSize}`)
      const data: PaginatedResponse = await response.json()
      
      setBlocks(data.data)
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev
      })
    } catch (error) {
      console.error('Error fetching blocks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlocks()
  }, [])

  const handleCreate = async (blockData: { name: string }) => {
    try {
      const response = await fetch('/api/v1/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData)
      })
      
      if (response.ok) {
        setShowForm(false)
        fetchBlocks(pagination.page, pagination.pageSize)
      }
    } catch (error) {
      console.error('Error creating block:', error)
    }
  }

  const handleUpdate = async (id: number, blockData: { name: string }) => {
    try {
      const response = await fetch(`/api/v1/blocks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData)
      })
      
      if (response.ok) {
        setEditingBlock(null)
        fetchBlocks(pagination.page, pagination.pageSize)
      }
    } catch (error) {
      console.error('Error updating block:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this block?')) return
    
    try {
      const response = await fetch(`/api/v1/blocks/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchBlocks(pagination.page, pagination.pageSize)
      }
    } catch (error) {
      console.error('Error deleting block:', error)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Block Name',
      render: (block: Block) => (
        <div className="font-medium text-gray-900">{block.name}</div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (block: Block) => (
        <div className="text-gray-500">
          {new Date(block.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (block: Block) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingBlock(block)}
            className="text-blue-600 hover:text-blue-900"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(block.id)}
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
          <h1 className="text-3xl font-bold text-gray-900">Blocks</h1>
          <p className="text-gray-600 mt-2">Manage pump blocks and stations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Block</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={blocks}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => fetchBlocks(page, pagination.pageSize)}
        />
      </div>

      {showForm && (
        <BlockForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingBlock && (
        <BlockForm
          block={editingBlock}
          onSubmit={(data) => handleUpdate(editingBlock.id, data)}
          onCancel={() => setEditingBlock(null)}
        />
      )}
    </div>
  )
}
