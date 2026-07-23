import { Request, Response, NextFunction } from 'express';
import { cartService } from './cart.service';
import { saleService } from './sale.service';
import { AppError } from '../../middleware/errorHandler';

export const cartController = {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = cartService.getCart(req.user!.userId);
      res.json({ status: 'success', data: cart });
    } catch (error) {
      next(error);
    }
  },

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { productVariantId, quantity } = req.body;
      const variant = await saleService.lookupVariant(productVariantId);
      if (!variant) {
        return next(new AppError('Variant not found or inactive', 404));
      }
      const cart = cartService.addItem(
        req.user!.userId,
        productVariantId,
        quantity || 1,
        Number(variant.sellingPrice),
      );
      res.json({ status: 'success', message: 'Item added to cart', data: cart });
    } catch (error) {
      next(error);
    }
  },

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { productVariantId, quantity } = req.body;
      const cart = cartService.updateItem(req.user!.userId, productVariantId, quantity);
      if (!cart) {
        return next(new AppError('Cart is empty', 404));
      }
      res.json({ status: 'success', message: 'Cart updated', data: cart });
    } catch (error) {
      next(error);
    }
  },

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { productVariantId } = req.body;
      const cart = cartService.removeItem(req.user!.userId, productVariantId);
      if (!cart) {
        return next(new AppError('Cart is empty', 404));
      }
      res.json({ status: 'success', message: 'Item removed from cart', data: cart });
    } catch (error) {
      next(error);
    }
  },

  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      cartService.clearCart(req.user!.userId);
      res.json({ status: 'success', message: 'Cart cleared' });
    } catch (error) {
      next(error);
    }
  },

  async holdCart(req: Request, res: Response, next: NextFunction) {
    try {
      cartService.holdCart(req.user!.userId, req.body.note);
      res.json({ status: 'success', message: 'Cart held successfully' });
    } catch (error) {
      next(error);
    }
  },

  async resumeCart(req: Request, res: Response, next: NextFunction) {
    try {
      const result = cartService.resumeCart(req.params.key);
      if (!result) {
        return next(new AppError('Held cart not found', 404));
      }
      res.json({ status: 'success', message: 'Cart resumed', data: result.cart });
    } catch (error) {
      next(error);
    }
  },

  async listHeld(_req: Request, res: Response, next: NextFunction) {
    try {
      const held = cartService.listHeldCarts();
      res.json({ status: 'success', data: held });
    } catch (error) {
      next(error);
    }
  },
};
