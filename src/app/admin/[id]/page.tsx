import prisma from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic';

export default async function AdminDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 상세보기 진입 시 읽음 처리
  await prisma.consultation.update({
    where: { id: parseInt(id) },
    data: { isRead: true }
  });

  const consultation = await prisma.consultation.findUnique({
    where: { id: parseInt(id) }
  });

  if (!consultation) return notFound();

  const parseJSON = (str: string | null) => {
    try {
      return str ? JSON.parse(str) : null;
    } catch (e) {
      return null;
    }
  };

  // 표시할 섹션들을 담을 배열
  let sections: { label: string, value: any }[] = [
    { label: "이름", value: consultation.name },
  ];

  // 값이 있는 기본 정보만 추가
  if (consultation.phone) sections.push({ label: "전화번호", value: consultation.phone });
  if (consultation.ssn) sections.push({ label: "주민등록번호/생년월일", value: consultation.ssn });
  if (consultation.gender) sections.push({ label: "성별", value: consultation.gender });

  const answers = parseJSON(consultation.answersJson);

  if (answers && Object.keys(answers).length > 0) {
    // 1. 최신 방식: answersJson에 저장된 답변들을 순회하며 표시
    Object.entries(answers).forEach(([label, value]) => {
      // 이미 위에 표시된 기본 정보는 건너뜀
      if (["이름", "전화번호", "성별", "주민등록번호", "생년월일"].includes(label)) return;
      
      sections.push({ 
        label, 
        value: Array.isArray(value) ? value.join(', ') : value 
      });
    });
  } else if (consultation.category === 'diet') {
    // 2. 과거 방식(Fallback): answersJson이 없는 이전 다이어트 신청 건 처리
    const legacyFields = [
      { label: "키/몸무게", value: consultation.heightWeight },
      { label: "최저 몸무게", value: consultation.lowestWeight },
      { label: "다이어트 경험", value: parseJSON(consultation.dietExperience)?.join(', ') },
      { label: "체중 증가 유형", value: parseJSON(consultation.weightGainType)?.join(', ') },
      { label: "음주/흡연", value: parseJSON(consultation.lifestyle)?.join(', ') },
      { label: "추위/더위", value: parseJSON(consultation.thermalSense)?.join(', ') },
      { label: "소화/대소변", value: parseJSON(consultation.digestion)?.join(', ') },
      { label: "식욕/흉협", value: parseJSON(consultation.appetiteChest)?.join(', ') },
      { label: "수면/체력", value: parseJSON(consultation.sleepEnergy)?.join(', ') },
      { label: "수면 시간", value: consultation.sleepDuration },
      { label: "신체증상", value: parseJSON(consultation.physicalSymptoms)?.join(', ') },
      { label: "여성질환", value: parseJSON(consultation.femaleHealth)?.join(', ') },
      { label: "연락 가능 시간", value: parseJSON(consultation.contactTime)?.join(', ') },
      { label: "관심 프로그램", value: parseJSON(consultation.programInterest)?.join(', ') },
    ];
    legacyFields.forEach(f => {
      if (f.value) sections.push(f);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 text-gray-800">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-black p-6 flex justify-between items-center text-white">
          <h1 className="text-xl font-bold">
            [{consultation.category === 'diet' ? '다이어트' : '체질/일반'}] {consultation.name}님의 상담 내역
          </h1>
          <Link href="/admin" className="text-sm border border-white/30 px-3 py-1 rounded hover:bg-white/10 transition-colors">목록</Link>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 gap-6">
            {sections.map((s, i) => (
              <div key={i} className="border-b pb-4 last:border-0">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">{s.label}</div>
                <div className="text-[16px] text-gray-900 font-medium leading-relaxed">
                  {s.value || <span className="text-gray-300">미입력</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t text-[11px] text-gray-400">
            접수 일시: {new Date(consultation.createdAt).toLocaleString('ko-KR')}
          </div>
        </div>
      </div>
    </div>
  )
}
