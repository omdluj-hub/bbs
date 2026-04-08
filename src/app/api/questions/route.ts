import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'diet'
    
    const questions = await prisma.question.findMany({
      where: { 
        isActive: true,
        category: category
      },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json({ success: true, data: questions })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const question = await prisma.question.create({
      data: {
        label: data.label,
        hint: data.hint,
        type: data.type,
        options: data.options ? JSON.stringify(data.options) : null,
        order: data.order || 0,
        required: data.required || false,
        category: data.category || 'diet'
      }
    })
    return NextResponse.json({ success: true, data: question })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create question' }, { status: 500 })
  }
}
