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
    const productId = searchParams.get('productId')
    
    let where: any = {}
    
    // Handle single date filter
    if (date) {
      where.recordDate = new Date(date)
    }
    
    // Handle date range filter
    if (startDate && endDate) {
      where.recordDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    // Handle product filter
    if (productId) {
      where.productId = parseInt(productId)
    }
    
    const { skip, take, page, pageSize } = getPagination(searchParams)
    const [items, total] = await Promise.all([
      prisma.stockRecord.findMany({ 
        where, 
        include: { 
          product: true
        }, 
        orderBy: [{ recordDate: 'desc' }, { product: { name: 'asc' } }], 
        skip, 
        take 
      }),
      prisma.stockRecord.count({ where }),
    ])
    const pagination = getPaginationMeta(page, pageSize, total)
    return Response.json({ data: items, ...pagination })
  } catch (e) {
    console.error('Error fetching stock records:', e)
    return serverError()
  }
}

const stockRecordCreateSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().min(0),
  recordDate: z.string().transform((val) => new Date(val)),
  notes: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = stockRecordCreateSchema.parse(body)

    // Check if a record already exists for this product and date
    const existingRecord = await prisma.stockRecord.findUnique({
      where: {
        productId_recordDate: {
          productId: validatedData.productId,
          recordDate: validatedData.recordDate
        }
      }
    })

    if (existingRecord) {
      return badRequest('Stock record already exists for this product and date. Use PATCH to update.')
    }

    const created = await prisma.stockRecord.create({ 
      data: validatedData,
      include: {
        product: true
      }
    })
    return Response.json(created, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return badRequest(`Invalid request data: ${e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')}`)
    }
    console.error('Error creating stock record:', e)
    return serverError()
  }
}
