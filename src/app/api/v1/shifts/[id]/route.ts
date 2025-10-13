import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { badRequest, serverError } from '@/lib/http'

const shiftUpdateSchema = z.object({ 
  name: z.string().min(1).optional(), 
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(), 
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional() 
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!id) return badRequest('Invalid ID')
    
    const body = await req.json()
    const parsed = shiftUpdateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)
    
    const { startTime, endTime, ...rest } = parsed.data
    const data: any = { ...rest }
    if (startTime) data.startTime = new Date(`1970-01-01T${startTime}`)
    if (endTime) data.endTime = new Date(`1970-01-01T${endTime}`)
    
    const updated = await prisma.shift.update({ where: { id }, data })
    return Response.json(updated)
  } catch (e) {
    return serverError()
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!id) return badRequest('Invalid ID')
    
    await prisma.shift.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    return serverError()
  }
}
