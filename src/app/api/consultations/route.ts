import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const category = data.category || 'diet'
    const answers = data.answers || {}

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
