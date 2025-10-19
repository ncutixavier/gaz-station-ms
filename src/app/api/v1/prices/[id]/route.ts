import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { badRequest, serverError } from '@/lib/http'
import { z } from 'zod'

const updatePriceSchema = z.object({
  saleUnitPrice: z.number().positive()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return badRequest('Invalid price ID')
    }

    const body = await request.json()
    const validatedData = updatePriceSchema.parse(body)

    const price = await prisma.price.findUnique({
      where: { id },
      include: { product: true }
    })

    if (!price) {
      return badRequest('Price not found')
    }

    // Store the old price for history
    const oldPrice = price.saleUnitPrice

    // Update the price
    const updatedPrice = await prisma.price.update({
      where: { id },
      data: { saleUnitPrice: validatedData.saleUnitPrice },
      include: { product: true }
    })

    // Save price history
    await prisma.priceHistory.create({
      data: {
        priceId: id,
        oldPrice: oldPrice,
        newPrice: validatedData.saleUnitPrice,
        changeDate: new Date()
      }
    })

    return Response.json(updatedPrice)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('Invalid request data')
    }
    console.error('Error updating price:', error)
    return serverError()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return badRequest('Invalid price ID')
    }

    await prisma.price.delete({
      where: { id }
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting price:', error)
    return serverError()
  }
}