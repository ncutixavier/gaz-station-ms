'use client'

import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Column {
  key: string
  label: string
  render: (item: any) => React.ReactNode
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  loading: boolean
  pagination: Pagination
  onPageChange: (page: number) => void
  onEdit?: (item: any) => void
  onDelete?: (id: number) => void
  expandedRows?: Set<number>
  renderExpandedContent?: (item: any) => React.ReactNode
}

export function DataTable({ data, columns, loading, pagination, onPageChange, onEdit, onDelete, expandedRows, renderExpandedContent }: DataTableProps) {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading data...</p>
        <p className="text-gray-400 text-sm mt-1">Please wait while we fetch the latest information</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-xl border border-purple-200/50">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + ((onEdit || onDelete) ? 1 : 0)} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl text-gray-400">📊</span>
                    </div>
                    <p className="text-gray-500 font-medium">No data available</p>
                    <p className="text-gray-400 text-sm mt-1">Start by adding some records</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <>
                  <tr key={item.id || index} className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 transition-all duration-200 group">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.render(item)}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-1">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="text-purple-600 hover:text-white p-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item.id)}
                              className="text-rose-600 hover:text-white p-2 rounded-lg hover:bg-gradient-to-r hover:from-rose-500 hover:to-red-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  {expandedRows && expandedRows.has(item.id) && renderExpandedContent && (
                    <tr>
                      <td colSpan={columns.length + ((onEdit || onDelete) ? 1 : 0)} className="px-6 py-4 bg-gradient-to-r from-purple-50/30 to-blue-50/30 border-l-4 border-purple-400">
                        {renderExpandedContent(item)}
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 px-6 py-4 flex items-center justify-between border-t border-purple-200/50">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-semibold text-purple-600">
                  {((pagination.page - 1) * pagination.pageSize) + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-purple-600">
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-purple-600">{pagination.total}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i
                  if (pageNum > pagination.totalPages) return null
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                        pageNum === pagination.page
                          ? 'z-10 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 border-purple-500 text-white shadow-lg'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 hover:border-purple-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
