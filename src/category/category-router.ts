import express from 'express';
import { CategoryController } from './category-controller';
import categoryValidator from './category-validator';
import { CategoryService } from './category-service';
import Logger from '../config/logger';
const router = express.Router();

// dependency injection
const categoryService = new CategoryService();

const categoryController = new CategoryController(categoryService, Logger);

router.post('/', categoryValidator, categoryController.create);

export default router;
