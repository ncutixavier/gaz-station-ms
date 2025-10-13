import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getPagination, getPaginationMeta, badRequest, serverError } from '@/lib/http'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const blockShiftId = searchParams.get('blockShiftId')
    const where = blockShiftId ? { blockShiftId: Number(blockShiftId) } : {}
    const { skip, take, page, pageSize } = getPagination(searchParams)
    const [items, total] = await Promise.all([
      prisma.index.findMany({ where, include: { product: true, blockShift: true }, orderBy: [{ blockShiftId: 'asc' }, { productId: 'asc' }], skip, take }),
      prisma.index.count({ where }),
    ])
    const pagination = getPaginationMeta(page, pageSize, total)
    return Response.json({ data: items, ...pagination })
  } catch (e) {
    return serverError()
  }
}

const readingCreateSchema = z.object({ blockShiftId: z.number(), productId: z.number(), startIndex: z.number(), endIndex: z.number() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = readingCreateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)
    const created = await prisma.index.create({ data: parsed.data })
    return Response.json(created, { status: 201 })
  } catch (e) {
    return serverError()
  }
}



