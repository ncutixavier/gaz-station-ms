'use client'

import { useState, useRef } from 'react'
import { formatNumber } from '@/lib/utils'

interface Product {
  id: number
  name: string
  description: string | null
}

interface Stock {
  id: number
  productId: number
  quantity: number
  updatedAt: string
  product: Product
}

interface StockCardsProps {
  stocks: Stock[]
  loading: boolean
  onEdit?: (stock: Stock) => void
}

export function StockCards({ stocks, loading, onEdit }: StockCardsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 // Width of one card + gap
      const currentScroll = scrollContainerRef.current.scrollLeft
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
    }
  }

  const getStockStatus = (quantity: number) => {
    if (quantity <= 50) return { status: 'critical', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' }
    if (quantity <= 100) return { status: 'low', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' }
    if (quantity <= 200) return { status: 'medium', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' }
    return { status: 'good', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'low':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <div className="relative">
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-80 bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Stock Data</h3>
        <p className="text-gray-600">No stock information available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Cards Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {stocks.map((stock) => {
          const stockStatus = getStockStatus(Number(stock.quantity))
          
          return (
            <div
              key={stock.id}
              className="flex-shrink-0 w-80 bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group"
              style={{ borderColor: stockStatus.borderColor.replace('border-', '').replace('-200', '') }}
              onClick={() => onEdit?.(stock)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${stockStatus.bgColor}`}>
                    <svg className={`w-5 h-5 ${stockStatus.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className={`p-1 rounded-full ${stockStatus.bgColor}`}>
                    {getStatusIcon(stockStatus.status)}
                  </div>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(stock)
                  }}
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {stock.product.name}
                </h3>
                {stock.product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {stock.product.description}
                  </p>
                )}
              </div>

              {/* Quantity Display */}
              <div className="mb-4">
                <div className="flex items-baseline space-x-2">
                  <span className={`text-3xl font-bold ${stockStatus.textColor}`}>
                    {formatNumber(Number(stock.quantity), 1)}
                  </span>
                  <span className="text-lg text-gray-500 font-medium">L</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${stockStatus.bgColor} ${stockStatus.textColor}`}>
                    {stockStatus.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    Stock Level
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      stockStatus.status === 'critical' ? 'bg-red-500' :
                      stockStatus.status === 'low' ? 'bg-yellow-500' :
                      stockStatus.status === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((Number(stock.quantity) / 300) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0L</span>
                  <span>300L</span>
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-xs text-gray-500">
                Updated: {new Date(stock.updatedAt).toLocaleDateString()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scroll Indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {stocks.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-gray-300"
          />
        ))}
      </div>
    </div>
  )
}

