import express from 'express';
import fileUpload from 'express-fileupload';
import { asyncErrorHandlerWrapper } from '../common/utils/asyncErrorHandlerWrapper';
import authenticate from '../common/middlewares/authenticate';
import { canAccess } from '../common/middlewares/canAccess';
import { ROLES as Roles } from '../common/constant';
import { S3Storage } from '../common/services/S3Storage';
import createHttpError from 'http-errors';
import {
    createToppingValidator,
    updateToppingValidator,
} from './topping-validator';
import { ToppingService } from './topping-service';
import { ToppingController } from './topping-controller';
import logger from '../config/logger';

const router = express.Router();

const toppingService = new ToppingService();

const toppingController = new ToppingController(
    new S3Storage(),
    toppingService,
    logger,
);

router.post(
    '/',
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 }, // 500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, 'File size exceeds the limit');
            next(error);
        },
    }),
    createToppingValidator,
    asyncErrorHandlerWrapper(toppingController.create),
);

router.put(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 }, // 500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, 'File size exceeds the limit');
            next(error);
        },
    }),
    updateToppingValidator,
    asyncErrorHandlerWrapper(toppingController.update),
);

router.get('/', asyncErrorHandlerWrapper(toppingController.getAll));

router.get('/:id', asyncErrorHandlerWrapper(toppingController.getById));

router.delete(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    asyncErrorHandlerWrapper(toppingController.delete),
);

export default router;
