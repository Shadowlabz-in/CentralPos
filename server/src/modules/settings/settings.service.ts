import prisma from '../../utils/prisma';

export const settingsService = {
  async getStore(storeId: string) {
    return prisma.store.findUnique({ where: { id: storeId } });
  },
  async updateStore(storeId: string, data: any) {
    return prisma.store.update({ where: { id: storeId }, data });
  },

  async getInvoice(storeId: string) {
    let setting = await prisma.invoiceSetting.findUnique({ where: { storeId } });
    if (!setting) {
      setting = await prisma.invoiceSetting.create({ data: { storeId } });
    }
    return setting;
  },
  async updateInvoice(storeId: string, data: any) {
    await this.getInvoice(storeId);
    return prisma.invoiceSetting.update({ where: { storeId }, data });
  },

  async getGst(storeId: string) {
    let setting = await prisma.gstSetting.findUnique({ where: { storeId } });
    if (!setting) {
      setting = await prisma.gstSetting.create({ data: { storeId } });
    }
    return setting;
  },
  async updateGst(storeId: string, data: any) {
    await this.getGst(storeId);
    return prisma.gstSetting.update({ where: { storeId }, data });
  },

  async getBarcode(storeId: string) {
    let setting = await prisma.barcodeSetting.findUnique({ where: { storeId } });
    if (!setting) {
      setting = await prisma.barcodeSetting.create({ data: { storeId } });
    }
    return setting;
  },
  async updateBarcode(storeId: string, data: any) {
    await this.getBarcode(storeId);
    return prisma.barcodeSetting.update({ where: { storeId }, data });
  },

  async getPrinter(storeId: string) {
    let setting = await prisma.printerSetting.findUnique({ where: { storeId } });
    if (!setting) {
      setting = await prisma.printerSetting.create({ data: { storeId } });
    }
    return setting;
  },
  async updatePrinter(storeId: string, data: any) {
    await this.getPrinter(storeId);
    return prisma.printerSetting.update({ where: { storeId }, data });
  },
};
