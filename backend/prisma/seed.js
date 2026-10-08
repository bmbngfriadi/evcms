const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Roles
  const rolesData = [
    { name: 'Administrator', description: 'Full access' },
    { name: 'User', description: 'Basic access' },
    { name: 'HRGA Leader', description: 'HRGA Leader access' },
    { name: 'HRGA Section Head', description: 'HRGA Section Head access' },
  ];

  const roles = {};
  for (const r of rolesData) {
    roles[r.name] = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  // 2. Permissions
  const permissionsData = [
    'dashboard.view',
    'charging.view', 'charging.create', 'charging.edit', 'charging.delete', 'charging.start', 'charging.finish', 'charging.cancel', 'charging.upload_evidence',
    'vehicle.view', 'vehicle.create', 'vehicle.edit', 'vehicle.delete',
    'tariff.view', 'tariff.create', 'tariff.edit', 'tariff.delete',
    'report.view', 'report.export',
    'user.view', 'user.create', 'user.edit', 'user.delete', 'user.manage_permission',
    'audit.view'
  ];

  const permissions = {};
  for (const p of permissionsData) {
    permissions[p] = await prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p, description: p },
    });
  }

  // 3. Assign all permissions to Administrator
  const adminRole = roles['Administrator'];
  for (const p of Object.values(permissions)) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: p.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: p.id
      }
    });
  }

  // 4. Administrator User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@evcms.local' },
    update: {},
    create: {
      email: 'admin@evcms.local',
      name: 'Super Admin',
      password: adminPassword,
      roleId: adminRole.id,
      isActive: true
    }
  });

  // 5. Default Vehicle
  await prisma.vehicle.upsert({
    where: { kode: 'EV001' },
    update: {},
    create: {
      kode: 'EV001',
      nomor_polisi: 'B 1234 BYD',
      merk: 'BYD',
      model: 'M6',
      tahun: 2024,
      kapasitas_baterai: 71.8,
      isActive: true
    }
  });

  // 6. Default Tariff
  const existingTariff = await prisma.electricityTariff.findFirst();
  if (!existingTariff) {
    await prisma.electricityTariff.create({
      data: {
        nama: 'Tarif Listrik Industri',
        harga_per_kwh: 1500,
        tanggal_mulai: new Date(),
        isActive: true
      }
    });
    console.log('Default tariff created.');
  } else {
    console.log('Tariff already exists, skipping default tariff creation.');
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
