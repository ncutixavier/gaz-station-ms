import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPagination, getPaginationMeta, serverError } from '@/lib/http'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const { skip, take, page, pageSize } = getPagination(searchParams)
    const productId = searchParams.get('productId')
    
    const where = productId ? { 
      price: { 
        productId: Number(productId) 
      } 
    } : {}
    
    const [items, total] = await Promise.all([
      prisma.priceHistory.findMany({ 
        where,
        include: { 
          price: {
            include: {
              product: true
            }
          }
        },
        orderBy: { changeDate: 'desc' }, 
        skip, 
        take 
      }),
      prisma.priceHistory.count({ where }),
    ])
    const pagination = getPaginationMeta(page, pageSize, total)
    return Response.json({ data: items, ...pagination })
  } catch (e) {
    return serverError()
  }
}
