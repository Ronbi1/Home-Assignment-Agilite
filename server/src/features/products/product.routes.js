import { Router } from 'express';
import * as productController from './product.controller.js';

const router = Router();

router.get('/meta', productController.getProductsMeta);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

export default router;
