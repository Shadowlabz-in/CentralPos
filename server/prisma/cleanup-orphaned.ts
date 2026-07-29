import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tables = ['country', 'category', 'brand', 'fabric', 'occasion', 'size', 'color', 'hsnCode', 'supplier'] as const;
  for (const t of tables) {
    const m = prisma[t as keyof typeof prisma] as any;
    const deleted = await m.deleteMany({ where: { storeId: null } });
    console.log(`Deleted ${deleted.count} from ${t} where storeId IS NULL`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
