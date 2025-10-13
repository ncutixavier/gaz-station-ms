import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { badRequest, serverError } from '@/lib/http'

const blockShiftUpdateSchema = z.object({ 
  blockId: z.number().optional(), 
  shiftId: z.number().optional(), 
  cashierId: z.number().optional(), 
  date: z.string().optional() 
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params
    const id = Number(idParam)
    if (!id) return badRequest('Invalid ID')
    
    const body = await req.json()
    const parsed = blockShiftUpdateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)
    
    const { date, ...rest } = parsed.data
    const data: any = { ...rest }
    if (date) data.date = new Date(date)
    
    const updated = await prisma.blockShift.update({ where: { id }, data })
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
    
    await prisma.blockShift.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    return serverError()
  }
}
