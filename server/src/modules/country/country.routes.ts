import { Router } from 'express';
import { countryController } from './country.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';
import { validate } from '../../middleware/validate';
import { createCountrySchema, updateCountrySchema } from './country.validation';

const router = Router();

router.get('/countries', authenticate, countryController.list);
router.get('/countries/:id', authenticate, countryController.getById);
router.post('/countries', authenticate, requirePermission(Permissions.PRODUCT_CREATE), validate(createCountrySchema), countryController.create);
router.patch('/countries/:id', authenticate, requirePermission(Permissions.PRODUCT_EDIT), validate(updateCountrySchema), countryController.update);
router.delete('/countries/:id', authenticate, requirePermission(Permissions.PRODUCT_DELETE), countryController.delete);

export default router;
