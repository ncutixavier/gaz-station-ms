import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getPagination, getPaginationMeta, badRequest, serverError } from '@/lib/http'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const where = date ? { date: new Date(date) } : {}
    const { skip, take, page, pageSize } = getPagination(searchParams)
    const [items, total] = await Promise.all([
      prisma.blockShift.findMany({ where, include: { block: true, shift: true, cashier: true }, orderBy: [{ date: 'desc' }, { id: 'asc' }], skip, take }),
      prisma.blockShift.count({ where }),
    ])
    const pagination = getPaginationMeta(page, pageSize, total)
    return Response.json({ data: items, ...pagination })
  } catch (e) {
    return serverError()
  }
}

const blockShiftCreateSchema = z.object({ blockId: z.number(), shiftId: z.number(), cashierId: z.number(), date: z.string() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = blockShiftCreateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)
    const created = await prisma.blockShift.create({ data: { ...parsed.data, date: new Date(parsed.data.date) } })
    return Response.json(created, { status: 201 })
  } catch (e) {
    return serverError()
  }
}



