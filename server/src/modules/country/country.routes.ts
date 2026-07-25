import { Router } from 'express';
import { countryController } from './country.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createCountrySchema, updateCountrySchema } from './country.validation';

const router = Router();

router.get('/countries', authenticate, countryController.list);
router.get('/countries/:id', authenticate, countryController.getById);
router.post('/countries', authenticate, authorize('ADMIN', 'MANAGER'), validate(createCountrySchema), countryController.create);
router.patch('/countries/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateCountrySchema), countryController.update);
router.delete('/countries/:id', authenticate, authorize('ADMIN'), countryController.delete);

export default router;
