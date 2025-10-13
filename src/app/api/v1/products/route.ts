import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getPagination, getPaginationMeta, badRequest, serverError } from '@/lib/http'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const { skip, take, page, pageSize } = getPagination(searchParams)
    const [items, total] = await Promise.all([
      prisma.product.findMany({ orderBy: { id: 'asc' }, skip, take }),
      prisma.product.count(),
    ])
    const pagination = getPaginationMeta(page, pageSize, total)
    return Response.json({ data: items, ...pagination })
  } catch (e) {
    return serverError()
  }
}

const productCreateSchema = z.object({ name: z.string().min(1), unitPrice: z.number() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = productCreateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)
    const created = await prisma.product.create({ data: parsed.data })
    return Response.json(created, { status: 201 })
  } catch (e) {
    return serverError()
  }
}



