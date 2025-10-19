'use client'

import { useEffect, useState } from 'react'
import { CalendarIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'

interface DailyReport {
  date: string
  totalEssence: number
  totalMazout: number
  totalRevenue: number
}

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [report, setReport] = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDailyReport = async (date: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/v1/reports/daily?date=${date}`)
      
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      } else {
        setError('Failed to fetch report data')
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      setError('Error fetching report data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailyReport(selectedDate)
  }, [selectedDate])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  const exportToPDF = async () => {
    if (!report) return
    
    try {
      const response = await fetch('/api/v1/reports/daily/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          format: 'pdf',
          data: report
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `daily-report-${selectedDate}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to generate PDF report')
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error generating PDF report')
    }
  }

  const exportToExcel = async () => {
    if (!report) return
    
    try {
      const response = await fetch('/api/v1/reports/daily/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          format: 'excel',
          data: report
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `daily-report-${selectedDate}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to generate Excel report')
      }
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Error generating Excel report')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and view daily, weekly, and monthly reports</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <ChartBarIcon className="h-5 w-5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Select Date:
            </label>
          </div>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading report...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {report && !loading && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Daily Report - {new Date(selectedDate).toLocaleDateString()}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-500">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Essence Sold</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {report.totalEssence} L
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-500">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Mazout Sold</p>
                    <p className="text-2xl font-bold text-green-900">
                      {report.totalMazout} L
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-500">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-purple-900">
                      ${report.totalRevenue}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Fuel Sales Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Essence:</span>
                      <span className="font-medium">{report.totalEssence} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mazout:</span>
                      <span className="font-medium">{report.totalMazout} L</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Total Volume:</span>
                      <span className="font-medium">
                        {(report.totalEssence + report.totalMazout)} L
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-medium text-green-600">${report.totalRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Price/L:</span>
                      <span className="font-medium">
                        ${(report.totalRevenue / (report.totalEssence + report.totalMazout))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Actions</h3>
              <div className="flex space-x-4">
                <button
                  onClick={exportToPDF}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <ChartBarIcon className="h-4 w-4" />
                  <span>Download Excel</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {!report && !loading && !error && (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">
              No sales data found for the selected date. Try selecting a different date.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
