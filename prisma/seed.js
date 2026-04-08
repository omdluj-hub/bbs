const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up database...');
  await prisma.consultation.deleteMany({});
  await prisma.question.deleteMany({});
  
  console.log('Seeding diet questions...');
  const dietQuestions = [
    { label: "전화번호", hint: "연락처를 입력해주세요", type: "text", options: null, order: 1, required: true, category: "diet" },
    { label: "주민등록번호", hint: "원치않으시면 생년월일 여섯자리만 입력해주세요", type: "text", options: null, order: 2, required: true, category: "diet" },
    { label: "성별", hint: null, type: "radio", options: JSON.stringify(["남성", "여성"]), order: 3, required: true, category: "diet" },
    { label: "키/몸무게", hint: "ex 163/65", type: "text", options: null, order: 4, required: true, category: "diet" },
    { label: "최근 5년간 최저 몸무게", hint: "ex 2년전 51kg", type: "text", options: null, order: 5, required: false, category: "diet" },
    { label: "다이어트 경험 체크", hint: null, type: "checkbox", options: JSON.stringify(['다이어트 양약(식욕억제제)', '다이어트 한약', '다이어트 보조식품(보조제)', '운동', '식단조절']), order: 6, required: false, category: "diet" },
    { label: "체중 증가 유형", hint: null, type: "checkbox", options: JSON.stringify(['짧은 기간 급격히 증가', '천천히 오랫동안 증가', '출산 후 증가', '요요로 증가', '수술/큰 병 후 증가']), order: 7, required: false, category: "diet" },
    { label: "음주/흡연 여부", hint: null, type: "checkbox", options: JSON.stringify(['음주 주 2회 이상', '음주 주 1회 이하', '흡연(전자담배 포함)', '비흡연자', '금연중']), order: 8, required: false, category: "diet" },
    { label: "추위/더위/한열", hint: null, type: "checkbox", options: JSON.stringify(['더위가 더 싫음', '추위가 더 싫음', '손/발 차가움', '손/발 뜨거움', '얼굴 열 올라옴']), order: 9, required: false, category: "diet" },
    { label: "소화/대소변", hint: null, type: "checkbox", options: JSON.stringify(['소화 잘됨', '소화 안됨', '대변 시원함', '소변 시원함', '변비/설사 자주', '변비약/유산균 복용']), order: 10, required: false, category: "diet" },
    { label: "식욕/흉협", hint: null, type: "checkbox", options: JSON.stringify(['식욕 좋음', '식욕 없음', '가슴 두근/답답', '가끔 숨 참']), order: 11, required: false, category: "diet" },
    { label: "수면/체력", hint: null, type: "checkbox", options: JSON.stringify(['잠 잘 잠', '잠 못 잠', '체력 좋음', '체력 약함']), order: 12, required: false, category: "diet" },
    { label: "하루 평균 수면 시간", hint: "ex 6시간", type: "text", options: null, order: 13, required: false, category: "diet" },
    { label: "신체증상/기타", hint: null, type: "checkbox", options: JSON.stringify(['얼굴/손발 부음', '두통 자주', '어지럼증 자주', '시야 흐림/이명']), order: 14, required: false, category: "diet" },
    { label: "여성질환 (해당 시 체크)", hint: null, type: "checkbox", options: JSON.stringify(['생리주기 불규칙', '주기 건너뜜', '생리통 심함']), order: 15, required: false, category: "diet" },
    { label: "연락 가능한 시간대", hint: null, type: "checkbox", options: JSON.stringify(['11:00~12:00', '12:00~13:00', '14:00~15:00', '15:00~16:00', '16:00~17:00', '17:00~18:00', '18:00~19:00', '19:00~20:00']), order: 16, required: false, category: "diet" },
    { label: "관심 있는 프로그램", hint: null, type: "checkbox", options: JSON.stringify(['비움탕+미감탕 1개월(36만원)', '다요스틱 1개월(24만원)', '다요정 2주(7만원)']), order: 17, required: false, category: "diet" },
  ];

  console.log('Seeding general questions...');
  const generalQuestions = [
    { label: "성별", hint: null, type: "radio", options: JSON.stringify(["남성", "여성"]), order: 3, required: true, category: "general" },
    { label: "키/몸무게", hint: "ex 163/65", type: "text", options: null, order: 4, required: true, category: "general" },
    { label: "최근 5년간 최저 몸무게", hint: "ex 2년전 51kg", type: "text", options: null, order: 5, required: false, category: "general" },
    { label: "다이어트 경험 체크", hint: null, type: "checkbox", options: JSON.stringify(['다이어트 양약(식욕억제제)', '다이어트 한약', '다이어트 보조식품(보조제)', '운동', '식단조절']), order: 6, required: false, category: "general" },
    { label: "체중 증가 유형", hint: null, type: "checkbox", options: JSON.stringify(['짧은 기간 급격히 증가', '천천히 오랫동안 증가', '출산 후 증가', '요요로 증가', '수술/큰 병 후 증가']), order: 7, required: false, category: "general" },
    { label: "음주/흡연 여부", hint: null, type: "checkbox", options: JSON.stringify(['음주 주 2회 이상', '음주 주 1회 이하', '흡연(전자담배 포함)', '비흡연자', '금연중']), order: 8, required: false, category: "general" },
    { label: "추위/더위/한열", hint: null, type: "checkbox", options: JSON.stringify(['더위가 더 싫음', '추위가 더 싫음', '손/발 차가움', '손/발 뜨거움', '얼굴 열 올라옴']), order: 9, required: false, category: "general" },
    { label: "소화/대소변", hint: null, type: "checkbox", options: JSON.stringify(['소화 잘됨', '소화 안됨', '대변 시원함', '소변 시원함', '변비/설사 자주', '변비약/유산균 복용']), order: 10, required: false, category: "general" },
    { label: "식욕/흉협", hint: null, type: "checkbox", options: JSON.stringify(['식욕 좋음', '식욕 없음', '가슴 두근/답답', '가끔 숨 참']), order: 11, required: false, category: "general" },
    { label: "수면/체력", hint: null, type: "checkbox", options: JSON.stringify(['잠 잘 잠', '잠 못 잠', '체력 좋음', '체력 약함']), order: 12, required: false, category: "general" },
    { label: "하루 평균 수면 시간", hint: "ex 6시간", type: "text", options: null, order: 13, required: false, category: "general" },
    { label: "신체증상/기타", hint: null, type: "checkbox", options: JSON.stringify(['얼굴/손발 부음', '두통 자주', '어지럼증 자주', '시야 흐림/이명']), order: 14, required: false, category: "general" },
    { label: "여성질환 (해당 시 체크)", hint: null, type: "checkbox", options: JSON.stringify(['생리주기 불규칙', '주기 건너뜜', '생리통 심함']), order: 15, required: false, category: "general" },
    { label: "연락 가능한 시간대", hint: null, type: "checkbox", options: JSON.stringify(['11:00~12:00', '12:00~13:00', '14:00~15:00', '15:00~16:00', '16:00~17:00', '17:00~18:00', '18:00~19:00', '19:00~20:00']), order: 16, required: false, category: "general" },
    { label: "관심 있는 프로그램", hint: null, type: "checkbox", options: JSON.stringify(['비움탕+미감탕 1개월(36만원)', '다요스틱 1개월(24만원)', '다요정 2주(7만원)']), order: 17, required: false, category: "general" },
  ];

  for (const q of dietQuestions) {
    await prisma.question.create({ data: q });
  }
  for (const q of generalQuestions) {
    await prisma.question.create({ data: q });
  }
  console.log('Seeding completed successfully!');
}

main()
  .catch(e => { 
    console.error('Seeding Error:', e); 
    process.exit(1); 
  })
  .finally(() => prisma.$disconnect());
