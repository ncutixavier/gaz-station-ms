import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPagination, getPaginationMeta, badRequest, serverError } from '@/lib/http'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, take } = getPagination(searchParams)

    const prices = await prisma.price.findMany({
      include: {
        product: true,
        priceHistory: {
          orderBy: { changeDate: 'desc' },
          take: 5
        }
      },
      skip,
      take,
      orderBy: { product: { name: 'asc' } }
    })

    const total = await prisma.price.count()

    const paginationMeta = getPaginationMeta(page, pageSize, total)

    return Response.json({
      data: prices,
      ...paginationMeta
    })
  } catch (error) {
    console.error('Error fetching prices:', error)
    return serverError()
  }
}

const createPriceSchema = z.object({
  productId: z.number().int().positive(),
  saleUnitPrice: z.number().positive()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPriceSchema.parse(body)

    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId }
    })

    if (!product) {
      return badRequest('Product not found')
    }

    // Check if price already exists for this product
    const existingPrice = await prisma.price.findUnique({
      where: { productId: validatedData.productId }
    })

    if (existingPrice) {
      return badRequest('Price already exists for this product. Use PATCH to update.')
    }

    const newPrice = await prisma.price.create({
      data: {
        productId: validatedData.productId,
        saleUnitPrice: validatedData.saleUnitPrice
      },
      include: {
        product: true
      }
    })

    // Create initial price history entry
    await prisma.priceHistory.create({
      data: {
        priceId: newPrice.id,
        oldPrice: null,
        newPrice: validatedData.saleUnitPrice,
        changeDate: new Date()
      }
    })

    return Response.json(newPrice, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('Invalid request data')
    }
    console.error('Error creating price:', error)
    return serverError()
  }
}