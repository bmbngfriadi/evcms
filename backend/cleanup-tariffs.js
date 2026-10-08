const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const duplicateTariffs = await prisma.electricityTariff.findMany({
        where: {
            nama: 'Tarif Listrik Industri'
        },
        orderBy: {
            id: 'asc'
        }
    });

    if (duplicateTariffs.length > 1) {
        // Keep the first one, delete the rest
        const toDeleteIds = duplicateTariffs.slice(1).map(t => t.id);
        const result = await prisma.electricityTariff.deleteMany({
            where: {
                id: {
                    in: toDeleteIds
                }
            }
        });
        console.log(`Deleted ${result.count} duplicate tariffs`);
    } else {
        console.log('No duplicates found.');
    }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
