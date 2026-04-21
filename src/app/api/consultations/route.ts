import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const category = data.category || 'diet'
    const answers = data.answers || {}

    // Resend 인스턴스를 요청 시점에 생성하여 빌드 오류 방지
    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // 유동적인 답변 데이터에서 특정 값을 찾아주는 헬퍼 함수
    const getVal = (legacyKey: string, labels: string[]) => {
      // 1. 최상위 레벨에 값이 있는지 확인
      if (data[legacyKey]) return data[legacyKey];
      // 2. answers 객체 내에 해당 라벨들이 있는지 확인
      for (const label of labels) {
        if (answers[label]) return answers[label];
      }
      return null;
    }

    // JSON 배열로 저장해야 하는 항목들을 위한 헬퍼
    const getJsonVal = (legacyKey: string, labels: string[]) => {
      const val = getVal(legacyKey, labels);
      if (!val) return "[]";
      return Array.isArray(val) ? JSON.stringify(val) : JSON.stringify([val]);
    }

    const consultation = await prisma.consultation.create({
      data: {
        category: category,
        name: data.name || answers["이름"] || "미입력",
        phone: data.phone || answers["전화번호"] || "",
        ssn: data.ssn || answers["주민등록번호"] || answers["생년월일"] || "",
        gender: data.gender || answers["성별"] || "",
        
        // 다이어트 설문 전용 필드 매핑 (동적 문항 라벨과 연결)
        heightWeight: getVal('heightWeight', ["키/몸무게", "키", "몸무게"]),
        lowestWeight: getVal('lowestWeight', ["최근 5년간 최저 몸무게", "최저 몸무게"]),
        dietExperience: getJsonVal('dietExperience', ["다이어트 경험 체크", "다이어트 경험"]),
        weightGainType: getJsonVal('weightGainType', ["체중 증가 유형"]),
        lifestyle: getJsonVal('lifestyle', ["음주/흡연 여부", "생활습관"]),
        thermalSense: getJsonVal('thermalSense', ["추위/더위/한열"]),
        digestion: getJsonVal('digestion', ["소화/대소변"]),
        appetiteChest: getJsonVal('appetiteChest', ["식욕/흉협"]),
        sleepEnergy: getJsonVal('sleepEnergy', ["수면/체력"]),
        sleepDuration: getVal('sleepDuration', ["하루 평균 수면 시간", "수면시간"]),
        physicalSymptoms: getJsonVal('physicalSymptoms', ["신체증상/기타"]),
        femaleHealth: getJsonVal('femaleHealth', ["여성질환 (해당 시 체크)", "여성질환"]),
        contactTime: getJsonVal('contactTime', ["연락 가능한 시간대"]),
        programInterest: getJsonVal('programInterest', ["관심 있는 프로그램"]),
        
        privacyAgreed: data.privacyAgreed === undefined ? true : data.privacyAgreed,
        answersJson: JSON.stringify(answers), // 모든 답변 원본 보관
      }
    })

    // 관리자 이메일 알림 발송 (비동기로 실행하여 응답 지연 최소화)
    try {
      if (resend) {
        const adminEmail = process.env.ADMIN_EMAIL || 'hoban2011902@naver.com';
        const emailResponse = await resend.emails.send({
          from: 'BBS Admin <onboarding@resend.dev>',
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
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://bbs-ruddy-iota.vercel.app'}/admin" 
                   style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   관리자 페이지에서 확인하기
                </a>
              </div>
            </div>
          `
        });
        console.log('Email sent successfully:', emailResponse);
      } else {
        console.warn('Resend API key is missing. Email notification skipped.');
      }
    } catch (emailError) {
      console.error('Email Notification Error:', emailError);
      // 이메일 발송 실패가 상담 접수 자체의 실패로 이어지지 않도록 함
    }

    return NextResponse.json({ success: true, data: consultation })
  } catch (error) {
    console.error('Submission Error:', error)
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
