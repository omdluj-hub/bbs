import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const category = data.category || 'diet'
    const answers = data.answers || {}

    // Resend 인스턴스 생성 및 환경 변수 체크
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('CRITICAL: RESEND_API_KEY is not defined in environment variables!');
    }

    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // 관리자 이메일 알림 발송 (확실히 완료될 때까지 기다림)
    try {
      if (resend && resendApiKey) {
        const adminEmail = process.env.ADMIN_EMAIL || 'omdluj@gmail.com';
        console.log(`[Email] Attempting send to: ${adminEmail} using key prefix: ${resendApiKey.substring(0, 7)}`);
        
        const emailResult = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: adminEmail,
          subject: `[새로운 상담 접수] ${consultation.name}님의 ${category === 'diet' ? '다이어트' : '일반'} 차트가 접수되었습니다.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
              <h2 style="color: #333;">새로운 상담이 접수되었습니다.</h2>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p><strong>접수 유형:</strong> ${category === 'diet' ? '다이어트 차트' : '체질/일반 설문'}</p>
              <p><strong>성함:</strong> ${consultation.name}</p>
              <p><strong>연락처:</strong> ${consultation.phone}</p>
              <p><strong>접수 일시:</strong> ${new Date(consultation.createdAt).toLocaleString('ko-KR')}</p>
              <div style="margin-top: 30px;">
                <a href="https://bbs-ruddy-iota.vercel.app/admin" 
                   style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   관리자 페이지에서 확인하기
                </a>
              </div>
            </div>
          `
        });

        if (emailResult.error) {
          console.error('[Email Error] Resend API returned an error:', JSON.stringify(emailResult.error));
        } else {
          console.log('[Email Success] Sent successfully. ID:', emailResult.data?.id);
        }
      } else {
        console.error('[Email Error] Cannot send email: Resend instance or API key is missing.');
      }
    } catch (emailError: any) {
      console.error('[Email Error] Unexpected exception:', emailError.message || emailError);
    }

    return NextResponse.json({ success: true, data: consultation })
  } catch (error: any) {
    console.error('Submission Error:', error.message || error)
    return NextResponse.json({ success: false, error: 'Failed to submit consultation' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const where = category && category !== 'all' ? { category } : {}
    
    const consultations = await prisma.consultation.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, data: consultations })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch consultations' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No IDs provided' }, { status: 400 })
    }
    await prisma.consultation.deleteMany({
      where: { id: { in: ids.map(id => parseInt(id)) } }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete consultations' }, { status: 500 })
  }
}
