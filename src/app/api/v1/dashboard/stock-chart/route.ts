import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serverError } from '@/lib/http'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') || new Date().getMonth() + 1
    const year = searchParams.get('year') || new Date().getFullYear()
    
    // Calculate start and end of the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    
    // Fetch stock records for the specified month
    const stockRecords = await prisma.stockRecord.findMany({
      where: {
        recordDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        product: true
      },
      orderBy: [
        { product: { name: 'asc' } },
        { recordDate: 'asc' }
      ]
    })
    
    // Group data by product and date
    const chartData: any = {}
    const labels: string[] = []
    const dateSet = new Set<string>()
    
    // Collect all unique dates
    stockRecords.forEach(record => {
      const dateStr = record.recordDate.toISOString().split('T')[0]
      dateSet.add(dateStr)
    })
    
    // Sort dates and create labels
    labels.push(...Array.from(dateSet).sort())
    
    // Group by product
    stockRecords.forEach(record => {
      const productName = record.product.name
      const dateStr = record.recordDate.toISOString().split('T')[0]
      
      if (!chartData[productName]) {
        chartData[productName] = {}
      }
      chartData[productName][dateStr] = parseFloat(record.quantity.toString())
    })
    
    // Create datasets for each product
    const datasets = Object.entries(chartData).map(([productName, data], index) => {
      const colors = [
        'rgb(59, 130, 246)', // blue
        'rgb(16, 185, 129)', // emerald
        'rgb(245, 158, 11)', // amber
        'rgb(239, 68, 68)',  // red
        'rgb(139, 92, 246)', // violet
        'rgb(236, 72, 153)', // pink
        'rgb(34, 197, 94)',  // green
      ]
      
      const dataPoints = labels.map(date => data[date] || null)
      
      return {
        label: productName,
        data: dataPoints,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    })
    
    return Response.json({
      labels,
      datasets,
      summary: {
        totalRecords: stockRecords.length,
        products: Object.keys(chartData).length,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      }
    })
  } catch (error) {
    console.error('Error fetching stock chart data:', error)
    return serverError()
  }
}
