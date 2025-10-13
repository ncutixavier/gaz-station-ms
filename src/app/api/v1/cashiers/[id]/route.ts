import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { badRequest, serverError } from '@/lib/http'

const cashierUpdateSchema = z.object({ 
  name: z.string().min(1).optional(), 
  email: z.string().email().optional(), 
  phone: z.string().optional() 
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params
    const id = Number(idParam)
    if (!id) return badRequest('Invalid ID')
    
    const body = await req.json()
    const parsed = cashierUpdateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)
    
    const updated = await prisma.cashier.update({ where: { id }, data: parsed.data })
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
    
    await prisma.cashier.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    return serverError()
  }
}
