import { PrismaClient } from '@prisma/client';
import path from 'path';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = 'superadmin@centralone.com';
  const superAdminPassword = 'superadmin123';

  // Create Firebase Auth user if Firebase credentials are configured
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    if (!admin.apps.length) {
      const credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      });

      admin.initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }

    try {
      await admin.auth().getUserByEmail(superAdminEmail);
      console.log(`Firebase user already exists: ${superAdminEmail}`);
    } catch {
      await admin.auth().createUser({
        email: superAdminEmail,
        password: superAdminPassword,
        displayName: 'Super Admin',
        emailVerified: true,
      });
      console.log(`Firebase user created: ${superAdminEmail} / ${superAdminPassword}`);
    }
  } else {
    console.log('Firebase credentials not configured locally — create the Firebase user via /signup');
    console.log(`  Email: ${superAdminEmail}`);
    console.log(`  Password: ${superAdminPassword}`);
  }

  const store = await prisma.store.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'Kapda Fashion House',
      code: 'MAIN',
      ownerName: 'Admin',
      address: 'Main Store',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91-9999999999',
      email: 'info@centralonefashion.com',
      gstin: '07ABCDE1234F1Z5',
    },
  });

  const existing = await prisma.user.findUnique({
    where: { email: superAdminEmail },
    include: { userRoles: true },
  });

  const role = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  if (!role) throw new Error('SUPER_ADMIN role not found — run seed-roles first');

  if (!existing) {
    const user = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash: '',
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        storeId: store.id,
      },
    });

    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    console.log(`Prisma super admin created: ${superAdminEmail}`);
  } else {
    const hasSuperAdmin = existing.userRoles.some((ur) => ur.roleId === role.id);
    if (!hasSuperAdmin) {
      await prisma.userRole.deleteMany({ where: { userId: existing.id } });
      await prisma.userRole.create({ data: { userId: existing.id, roleId: role.id } });
      console.log(`Prisma super admin upgraded: ${superAdminEmail}`);
    } else {
      console.log(`Prisma super admin already exists: ${superAdminEmail}`);
    }
  }
}

main()
  .catch((e) => { console.error('Super admin seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
