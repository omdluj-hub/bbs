const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.question.count()
  console.log(`Questions count: ${count}`)
  const all = await prisma.question.findMany()
  console.log(JSON.stringify(all, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
