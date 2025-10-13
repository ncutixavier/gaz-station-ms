import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { badRequest, serverError } from '@/lib/http'

const stockUpdateSchema = z.object({ 
  quantity: z.number() 
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params
    const id = Number(idParam)
    if (!id) return badRequest('Invalid ID')
    
    const body = await req.json()
    const parsed = stockUpdateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)
    
    const updated = await prisma.stock.update({ where: { id }, data: parsed.data })
    return Response.json(updated)
  } catch (e) {
    return serverError()
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params
    const id = Number(idParam)
    if (!id) return badRequest('Invalid ID')
    
    await prisma.stock.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    return serverError()
  }
}
