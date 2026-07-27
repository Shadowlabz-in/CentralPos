import { planRepository } from './plan.repository';
import { AppError } from '../../middleware/errorHandler';

export const planService = {
  async list(activeOnly = false) {
    return planRepository.findAll(activeOnly);
  },

  async getById(id: string) {
    const plan = await planRepository.findById(id);
    if (!plan) throw new AppError('Plan not found', 404);
    return plan;
  },

  async getByCode(code: string) {
    const plan = await planRepository.findByCode(code);
    if (!plan) throw new AppError('Plan not found', 404);
    return plan;
  },

  async create(data: any) {
    const existing = await planRepository.findByCode(data.code);
    if (existing) throw new AppError(`Plan with code '${data.code}' already exists`, 409);
    return planRepository.create(data);
  },

  async update(id: string, data: any) {
    const plan = await planRepository.findById(id);
    if (!plan) throw new AppError('Plan not found', 404);
    if (data.code && data.code !== plan.code) {
      const existing = await planRepository.findByCode(data.code);
      if (existing) throw new AppError(`Plan with code '${data.code}' already exists`, 409);
    }
    return planRepository.update(id, data);
  },

  async delete(id: string) {
    const plan = await planRepository.findById(id);
    if (!plan) throw new AppError('Plan not found', 404);
    return planRepository.delete(id);
  },

  async getStoreSubscription(storeId: string) {
    const sub = await planRepository.findSubscription(storeId);
    if (!sub) return null;
    const metrics = await planRepository.getSubscriptionMetrics(storeId);
    return { ...sub, metrics };
  },

  async setStoreSubscription(storeId: string, data: any) {
    const plan = await planRepository.findById(data.planId);
    if (!plan) throw new AppError('Plan not found', 404);
    return planRepository.upsertSubscription(storeId, {
      planId: data.planId,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : undefined,
      autoRenew: data.autoRenew,
      notes: data.notes,
    });
  },

  async removeStoreSubscription(storeId: string) {
    return planRepository.removeSubscription(storeId);
  },
};
