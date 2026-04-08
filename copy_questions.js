const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // 기존 general 문항 삭제 (깨끗한 상태에서 복사 시작)
  await prisma.question.deleteMany({ where: { category: 'general' } });

  // diet 문항 가져오기
  const dietQs = await prisma.question.findMany({ 
    where: { category: 'diet' } 
  });

  for (const q of dietQs) {
    // 전화번호는 제외하고 복사
    if (q.label === '전화번호') continue;

    await prisma.question.create({
      data: {
        label: q.label,
        hint: q.hint,
        type: q.type,
        options: q.options,
        order: q.order,
        required: q.required,
        category: 'general'
      }
    });
  }
  console.log('Successfully copied diet questions to general category (excluding phone number).');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
