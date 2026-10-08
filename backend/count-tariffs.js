const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.electricityTariff.count();
    const tariffs = await prisma.electricityTariff.findMany();
    console.log('Total tariffs:', count);
    console.log(tariffs);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
