const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function main() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' }
      ]
    });
    console.log('---START_JSON---');
    console.log(JSON.stringify(questions));
    console.log('---END_JSON---');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
