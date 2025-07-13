import express from 'express';
import { ProductController } from './product-controller';
import {
    productCreateValidator,
    productUpdateValidator,
} from './product-validator';
import { ProductService } from './product-service';
import Logger from '../config/logger';
import { asyncErrorHandlerWrapper } from '../common/utils/asyncErrorHandlerWrapper';
import authenticate from '../common/middlewares/authenticate';
import { canAccess } from '../common/middlewares/canAccess';
import { ROLES } from '../common/constant';
import fileUpload from 'express-fileupload';

const router = express.Router();

// dependency injection
const productService = new ProductService();

const productController = new ProductController(productService, Logger);

router.post(
    '/',
    authenticate,
    canAccess([ROLES.ADMIN]),
    fileUpload(),
    productCreateValidator,
    asyncErrorHandlerWrapper(productController.create),
);

export default router;
