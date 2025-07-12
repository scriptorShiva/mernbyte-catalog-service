import express from 'express';
import { CategoryController } from './category-controller';
import {
    categoryCreateValidator,
    categoryUpdateValidator,
} from './category-validator';
import { CategoryService } from './category-service';
import Logger from '../config/logger';
import { asyncErrorHandlerWrapper } from '../common/utils/asyncErrorHandlerWrapper';
import authenticate from '../common/middlewares/authenticate';
import { canAccess } from '../common/middlewares/canAccess';
import { ROLES } from '../common/constant';

const router = express.Router();

// dependency injection
const categoryService = new CategoryService();

const categoryController = new CategoryController(categoryService, Logger);

router.post(
    '/',
    authenticate,
    canAccess([ROLES.ADMIN]),
    categoryCreateValidator,
    asyncErrorHandlerWrapper(categoryController.create),
);

router.patch(
    '/:id',
    authenticate,
    canAccess([ROLES.ADMIN]),
    categoryUpdateValidator,
    asyncErrorHandlerWrapper(categoryController.update),
);

router.get('/', asyncErrorHandlerWrapper(categoryController.getAll));

router.get('/:id', asyncErrorHandlerWrapper(categoryController.getById));

router.delete(
    '/:id',
    authenticate,
    canAccess([ROLES.ADMIN]),
    asyncErrorHandlerWrapper(categoryController.delete),
);

export default router;
