import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getPagination, getPaginationMeta, badRequest, serverError } from '@/lib/http'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const { skip, take, page, pageSize } = getPagination(searchParams)
    const [items, total] = await Promise.all([
      prisma.shift.findMany({ orderBy: { id: 'asc' }, skip, take }),
      prisma.shift.count(),
    ])
    const pagination = getPaginationMeta(page, pageSize, total)
    return Response.json({ data: items, ...pagination })
  } catch (e) {
    return serverError()
  }
}

const shiftCreateSchema = z.object({ name: z.string().min(1), startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/), endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/) })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = shiftCreateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)
    const created = await prisma.shift.create({ data: { name: parsed.data.name, startTime: new Date(`1970-01-01T${parsed.data.startTime}`), endTime: new Date(`1970-01-01T${parsed.data.endTime}`) } })
    return Response.json(created, { status: 201 })
  } catch (e) {
    return serverError()
  }
}



