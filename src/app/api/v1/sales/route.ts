import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getPagination, getPaginationMeta, badRequest, serverError } from '@/lib/http'

function computeLitresSold(startIndex: any, endIndex: any) {
  return Number(startIndex) - Number(endIndex)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const where = date ? { date: new Date(date) } : {}
    const { skip, take, page, pageSize } = getPagination(searchParams)
    const [items, total] = await Promise.all([
      prisma.sale.findMany({ where, include: { product: true, blockShift: true }, orderBy: [{ date: 'desc' }, { id: 'asc' }], skip, take }),
      prisma.sale.count({ where }),
    ])
    const pagination = getPaginationMeta(page, pageSize, total)
    return Response.json({ data: items, ...pagination })
  } catch (e) {
    return serverError()
  }
}

const salesComputeSchema = z.object({ blockShiftId: z.number(), date: z.string() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = salesComputeSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)
    const indexes = await prisma.index.findMany({
      where: { blockShiftId: parsed.data.blockShiftId },
      include: { 
        product: {
          include: {
            prices: true
          }
        }
      },
    })
    const date = new Date(parsed.data.date)
    const created = await prisma.$transaction(async (tx) => {
      await tx.sale.deleteMany({ where: { blockShiftId: parsed.data.blockShiftId, date } })
      const rows = [] as any[]
      for (const idx of indexes) {
        const litresSold = computeLitresSold(idx.startIndex, idx.endIndex)
        const revenue = litresSold * Number(idx.product.prices?.saleUnitPrice || 0)
        const row = await tx.sale.create({ data: { blockShiftId: parsed.data.blockShiftId, productId: idx.productId, litresSold, revenue, date } })
        rows.push(row)
      }
      return rows
    })
    return Response.json(created, { status: 201 })
  } catch (e) {
    return serverError()
  }
}


