import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPagination, serverError } from '@/lib/http'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date')
    const date = dateStr ? new Date(dateStr) : new Date()
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const sales = await prisma.sale.findMany({ where: { date: { gte: start, lte: end } }, include: { product: true } })

    let totalEssence = 0
    let totalMazout = 0
    let totalRevenue = 0

    for (const s of sales) {
      totalRevenue += Number(s.revenue)
      if (s.product.name.toLowerCase() === 'essence') totalEssence += Number(s.litresSold)
      else if (s.product.name.toLowerCase() === 'mazout') totalMazout += Number(s.litresSold)
    }

    return Response.json({ date: start.toISOString().slice(0, 10), totalEssence, totalMazout, totalRevenue })
  } catch (e) {
    return serverError()
  }
}


