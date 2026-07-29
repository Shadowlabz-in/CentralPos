import prisma from '../../utils/prisma';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { config } from '../../config';

const BACKUP_DIR = path.join(__dirname, '../../../uploads/backups');
const DATABASE_URL = config.database.url;

function getDbUrl(): string {
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return DATABASE_URL;
}

export const backupService = {
  async create(createdById: string, storeId: string) {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `central_one_backup_${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, filename);

    execSync(`pg_dump "${getDbUrl()}" > "${filePath}"`, {
      timeout: 60000,
    });

    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    const backup = await prisma.backup.create({
      data: { filename, filePath, fileSize, createdById, storeId } as any,
    });

    return backup;
  },

  async list(storeId: string, page: number, limit: number) {
    const where = { storeId };
    const [data, total] = await Promise.all([
      prisma.backup.findMany({
        where,
        include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.backup.count({ where }),
    ]);
    return { data, total };
  },

  async restore(backupId: string) {
    const backup = await prisma.backup.findUnique({ where: { id: backupId } });
    if (!backup) throw new Error('Backup not found');
    if (!fs.existsSync(backup.filePath)) throw new Error('Backup file not found on disk');

    execSync(`psql "${getDbUrl()}" < "${backup.filePath}"`, {
      timeout: 120000,
    });

    return { message: 'Database restored successfully' };
  },
};
