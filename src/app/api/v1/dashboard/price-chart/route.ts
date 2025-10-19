import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serverError } from '@/lib/http'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    
    // Calculate start and end of the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    
    // Fetch price history for the specified month
    const priceHistory = await prisma.priceHistory.findMany({
      where: {
        changeDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        price: {
          include: {
            product: true
          }
        }
      },
      orderBy: [
        { price: { product: { name: 'asc' } } },
        { changeDate: 'asc' }
      ]
    })
    
    // Also get current prices for products that might not have price history in this month
    const currentPrices = await prisma.price.findMany({
      include: {
        product: true
      }
    })
    
    // Group data by product and date
    const chartData: any = {}
    const labels: string[] = []
    const dateSet = new Set<string>()
    
    // Collect all unique dates from price history
    priceHistory.forEach(record => {
      const dateStr = record.changeDate.toISOString().split('T')[0]
      dateSet.add(dateStr)
    })
    
    // Add current date if we have current prices
    if (currentPrices.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      dateSet.add(today)
    }
    
    // Sort dates and create labels
    labels.push(...Array.from(dateSet).sort())
    
    // Group by product
    priceHistory.forEach(record => {
      const productName = record.price.product.name
      const dateStr = record.changeDate.toISOString().split('T')[0]
      
      if (!chartData[productName]) {
        chartData[productName] = {}
      }
      chartData[productName][dateStr] = parseFloat(record.newPrice.toString())
    })
    
    // Add current prices for products without recent price history
    currentPrices.forEach(price => {
      const productName = price.product.name
      const today = new Date().toISOString().split('T')[0]
      
      if (!chartData[productName]) {
        chartData[productName] = {}
      }
      
      // Only add current price if no recent price history exists
      if (!chartData[productName][today]) {
        chartData[productName][today] = parseFloat(price.saleUnitPrice.toString())
      }
    })
    
    // Create datasets for each product
    const datasets = Object.entries(chartData).map(([productName, data], index) => {
      const productData = data as Record<string, number>
      const colors = [
        'rgb(239, 68, 68)',  // red
        'rgb(16, 185, 129)', // emerald
        'rgb(245, 158, 11)', // amber
        'rgb(59, 130, 246)', // blue
        'rgb(139, 92, 246)', // violet
        'rgb(236, 72, 153)', // pink
        'rgb(34, 197, 94)',  // green
      ]
      
      const dataPoints = labels.map(date => productData[date] || null)
      
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
        totalPriceChanges: priceHistory.length,
        products: Object.keys(chartData).length,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      }
    })
  } catch (error) {
    console.error('Error fetching price chart data:', error)
    return serverError()
  }
}
