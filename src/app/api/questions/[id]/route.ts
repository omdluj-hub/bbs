import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json()
    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: {
        label: data.label,
        hint: data.hint,
        type: data.type,
        options: data.options ? JSON.stringify(data.options) : null,
        order: data.order,
        required: data.required,
        isActive: data.isActive,
        category: data.category
      }
    })

    return NextResponse.json({ success: true, data: question })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update question' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.question.delete({
      where: { id: parseInt(id) }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete question' }, { status: 500 })
  }
}
