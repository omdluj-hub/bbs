import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isRead } = await request.json()
    const { id } = await params
    const consultationId = parseInt(id)
    
    const updated = await prisma.consultation.update({
      where: { id: consultationId },
      data: { isRead }
    })
    
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const consultationId = parseInt(id)
    await prisma.consultation.delete({
      where: { id: consultationId }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 })
  }
}
