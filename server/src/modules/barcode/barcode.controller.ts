import { Request, Response, NextFunction } from 'express';
import { barcodeService } from './barcode.service';

export const barcodeController = {
  async lookup(req: Request, res: Response, next: NextFunction) {
    try {
      const variant = await barcodeService.lookupBarcode(req.params.barcode);
      res.json({ status: 'success', data: variant });
    } catch (error) {
      next(error);
    }
  },

  async regenerate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await barcodeService.regenerate(req.params.variantId);
      res.json({ status: 'success', message: 'Barcode regenerated', data: result });
    } catch (error) {
      next(error);
    }
  },

  async print(req: Request, res: Response, next: NextFunction) {
    try {
      const imagePath = await barcodeService.getBarcodeImagePath(req.params.variantId);
      res.json({ status: 'success', data: { imageUrl: imagePath } });
    } catch (error) {
      next(error);
    }
  },
};
