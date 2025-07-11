import express from 'express';
import { CategoryController } from './category-controller';
import categoryValidator from './category-validator';
import { CategoryService } from './category-service';
import Logger from '../config/logger';
import { asyncErrorHandlerWrapper } from '../common/utils/asyncErrorHandlerWrapper';
import authenticate from '../common/middlewares/authenticate';

const router = express.Router();

// dependency injection
const categoryService = new CategoryService();

const categoryController = new CategoryController(categoryService, Logger);

router.post(
    '/',
    authenticate,
    categoryValidator,
    asyncErrorHandlerWrapper(categoryController.create),
);

export default router;
