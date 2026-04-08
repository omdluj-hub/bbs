const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    const res = await prisma.consultation.create({
      data: {
        name: "테스트2",
        phone: "010-1234-5678",
        ssn: "900101",
        gender: "남성",
        // heightWeight omitted
        privacyAgreed: true,
        appetiteChest: JSON.stringify(["식욕 좋음"]),
        sleepEnergy: JSON.stringify(["잠 잘 잠"]),
        sleepDuration: "7시간"
      }
    })
    console.log("Success:", res)
    console.log("sleepEnergy:", res.sleepEnergy)
    console.log("sleepDuration:", res.sleepDuration)
  } catch (err) {
    console.error("Error:", err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
