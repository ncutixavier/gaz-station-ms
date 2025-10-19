import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { badRequest, serverError } from '@/lib/http'

const indexUpdateSchema = z.object({ 
  startIndex: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) throw new Error('Invalid number')
    return num
  }).pipe(z.number().min(0)).optional(), 
  endIndex: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) throw new Error('Invalid number')
    return num
  }).pipe(z.number().min(0)).optional() 
}).refine((data) => {
  // Only validate if both values are provided
  if (data.startIndex !== undefined && data.endIndex !== undefined) {
    return data.startIndex > data.endIndex
  }
  return true
}, {
  message: "Start index must be higher than end index",
  path: ["startIndex"]
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return badRequest('Invalid index ID')
    }

    const body = await request.json()
    const validatedData = indexUpdateSchema.parse(body)

    // Get the existing index to validate against current values
    const existingIndex = await prisma.index.findUnique({
      where: { id }
    })

    if (!existingIndex) {
      return badRequest('Index not found')
    }

    // Validate endIndex against existing startIndex if only endIndex is being updated
    if (validatedData.endIndex !== undefined && validatedData.startIndex === undefined) {
      if (validatedData.endIndex >= existingIndex.startIndex) {
        return badRequest('End index must be lower than start index')
      }
    }

    // Validate startIndex against existing endIndex if only startIndex is being updated
    if (validatedData.startIndex !== undefined && validatedData.endIndex === undefined) {
      if (validatedData.startIndex <= existingIndex.endIndex) {
        return badRequest('Start index must be higher than end index')
      }
    }

    const updatedIndex = await prisma.index.update({
      where: { id },
      data: validatedData,
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

    return Response.json(updatedIndex)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('Invalid request data')
    }
    console.error('Error updating index:', error)
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
      return badRequest('Invalid index ID')
    }

    await prisma.index.delete({
      where: { id }
    })

    return Response.json({ message: 'Index deleted successfully' })
  } catch (error) {
    console.error('Error deleting index:', error)
    return serverError()
  }
}
