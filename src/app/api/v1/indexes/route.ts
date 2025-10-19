import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getPagination, getPaginationMeta, badRequest, serverError } from '@/lib/http'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const blockShiftId = searchParams.get('blockShiftId')
    const where = blockShiftId ? { blockShiftId: parseInt(blockShiftId) } : {}
    const { skip, take, page, pageSize } = getPagination(searchParams)
    const [items, total] = await Promise.all([
      prisma.index.findMany({ 
        where, 
        include: { 
          product: true,
          blockShift: {
            include: {
              block: true,
              shift: true,
              cashier: true
            }
          }
        }, 
        orderBy: { createdAt: 'desc' }, 
        skip, 
        take 
      }),
      prisma.index.count({ where }),
    ])
    const pagination = getPaginationMeta(page, pageSize, total)
    return Response.json({ data: items, ...pagination })
  } catch (e) {
    return serverError()
  }
}

const indexCreateSchema = z.object({ 
  blockShiftId: z.number(), 
  productId: z.number(), 
  startIndex: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) throw new Error('Invalid number')
    return num
  }).pipe(z.number().min(0)), 
  endIndex: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) throw new Error('Invalid number')
    return num
  }).pipe(z.number().min(0))
}).refine((data) => data.startIndex > data.endIndex, {
  message: "Start index must be higher than end index",
  path: ["startIndex"]
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = indexCreateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)
    
    // Check if index already exists for this blockShift and product
    const existingIndex = await prisma.index.findUnique({
      where: {
        blockShiftId_productId: {
          blockShiftId: parsed.data.blockShiftId,
          productId: parsed.data.productId
        }
      }
    })

    if (existingIndex) {
      return badRequest('Index already exists for this block shift and product. Use PATCH to update.')
    }

    const created = await prisma.index.create({ 
      data: parsed.data,
      include: {
        product: true,
        blockShift: {
          include: {
            block: true,
            shift: true,
            cashier: true
          }
        }
      }
    })
    return Response.json(created, { status: 201 })
  } catch (e) {
    return serverError()
  }
}
