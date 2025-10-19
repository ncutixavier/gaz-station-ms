import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { badRequest, serverError, notFound } from '@/lib/http'

const stockRecordUpdateSchema = z.object({
  quantity: z.number().min(0).optional(),
  recordDate: z.string().transform((val) => new Date(val)).optional(),
  notes: z.string().optional()
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return badRequest('Invalid stock record ID')
    }

    const body = await req.json()
    const validatedData = stockRecordUpdateSchema.parse(body)

    // Check if the record exists
    const existingRecord = await prisma.stockRecord.findUnique({
      where: { id }
    })

    if (!existingRecord) {
      return notFound('Stock record not found')
    }

    // If updating the date, check for conflicts
    if (validatedData.recordDate) {
      const conflictRecord = await prisma.stockRecord.findUnique({
        where: {
          productId_recordDate: {
            productId: existingRecord.productId,
            recordDate: validatedData.recordDate
          }
        }
      })

      if (conflictRecord && conflictRecord.id !== id) {
        return badRequest('A stock record already exists for this product and date')
      }
    }

    const updated = await prisma.stockRecord.update({
      where: { id },
      data: validatedData,
      include: {
        product: true
      }
    })

    return Response.json(updated)
  } catch (e) {
    if (e instanceof z.ZodError) {
      return badRequest('Invalid request data')
    }
    console.error('Error updating stock record:', e)
    return serverError()
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return badRequest('Invalid stock record ID')
    }

    const deleted = await prisma.stockRecord.delete({
      where: { id }
    })

    return Response.json({ message: 'Stock record deleted successfully' })
  } catch (e) {
    console.error('Error deleting stock record:', e)
    return serverError()
  }
}
