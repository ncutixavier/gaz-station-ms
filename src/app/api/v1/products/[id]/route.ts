import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { badRequest, serverError } from '@/lib/http'

const productUpdateSchema = z.object({ 
  name: z.string().min(1).optional(), 
  unitPrice: z.number().optional() 
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!id) return badRequest('Invalid ID')
    
    const body = await req.json()
    const parsed = productUpdateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)
    
    const updated = await prisma.product.update({ where: { id }, data: parsed.data })
    return Response.json(updated)
  } catch (e) {
    return serverError()
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!id) return badRequest('Invalid ID')
    
    await prisma.product.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    return serverError()
  }
}
