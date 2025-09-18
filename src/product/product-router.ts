import express from 'express';
import { ProductController } from './product-controller';
import {
    productCreateValidator,
    productUpdateValidator,
} from './product-validator';
import { ProductService } from './product-service';
import { ToppingService } from '../toppings/topping-service';
import Logger from '../config/logger';
import { asyncErrorHandlerWrapper } from '../common/utils/asyncErrorHandlerWrapper';
import authenticate from '../common/middlewares/authenticate';
import { canAccess } from '../common/middlewares/canAccess';
import { ROLES } from '../common/constant';
import fileUpload from 'express-fileupload'; // This is used for handling file uploads or multipart form data
import { S3Storage } from '../common/services/S3Storage';
import createHttpError from 'http-errors';

const router = express.Router();

// dependency injection
const productService = new ProductService();
const toppingService = new ToppingService();
const s3Storage = new S3Storage();

const productController = new ProductController(
    productService,
    toppingService,
    Logger,
    s3Storage,
);

router.post(
    '/',
    authenticate,
    canAccess([ROLES.ADMIN, ROLES.MANAGER]),
    fileUpload({
        limits: {
            fileSize: 5 * 1024 * 1024, // 5 MB limit
        },
        abortOnLimit: true, // Abort if the file size exceeds the limit
        limitHandler: (_req, _res, next) => {
            const error = createHttpError(
                413,
                'File size exceeds the limit of 5 MB',
            );
            next(error);
        },
    }),
    productCreateValidator,
    asyncErrorHandlerWrapper(productController.create),
);

router.put(
    '/:id',
    authenticate,
    canAccess([ROLES.ADMIN, ROLES.MANAGER]),
    fileUpload({
        limits: {
            fileSize: 5 * 1024 * 1024, // 5 MB limit
        },
        abortOnLimit: true, // Abort if the file size exceeds the limit
        limitHandler: (_req, _res, next) => {
            const error = createHttpError(
                413,
                'File size exceeds the limit of 5 MB',
            );
            next(error);
        },
    }),
    productUpdateValidator,
    asyncErrorHandlerWrapper(productController.update),
);

router.get('/', asyncErrorHandlerWrapper(productController.getAll));

router.get('/:id', asyncErrorHandlerWrapper(productController.getById));

router.delete(
    '/:id',
    authenticate,
    canAccess([ROLES.ADMIN, ROLES.MANAGER]),
    asyncErrorHandlerWrapper(productController.delete),
);

export default router;
