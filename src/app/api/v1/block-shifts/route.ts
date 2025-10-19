import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getPagination, getPaginationMeta, badRequest, serverError } from '@/lib/http'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let where: any = {}
    
    // Handle single date filter
    if (date) {
      where.date = new Date(date)
    }
    
    // Handle date range filter
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    const { skip, take, page, pageSize } = getPagination(searchParams)
    const [items, total] = await Promise.all([
      prisma.blockShift.findMany({ 
        where, 
        include: { 
          block: true, 
          shift: true, 
          cashier: true,
          indexes: {
            include: {
              product: {
                include: {
                  prices: true
                }
              }
            }
          }
        }, 
        orderBy: [{ date: 'desc' }, { id: 'asc' }], 
        skip, 
        take 
      }),
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
  } catch (e: any) {
    // Handle unique constraint violation
    if (e.code === 'P2002') {
      return badRequest('A block shift with this combination of block, shift, cashier, and date already exists')
    }
    console.error('Error creating block shift:', e)
    return serverError()
  }
}



