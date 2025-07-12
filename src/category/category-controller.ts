import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { Category } from './category-types';
import { CategoryService } from './category-service';
import { Logger } from 'winston';

export class CategoryController {
    // dependency injections for injecting the service. Now, whenever this controller is called, it will neet toinject the service
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.delete = this.delete.bind(this);
    }
    async create(req: Request, res: Response, next: NextFunction) {
        // 1. get validation result : as we have used validation middleware
        const result = validationResult(req);

        // if result is not empty : means we have any error then send error to global error handler
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg));
        }

        const { name, priceConfiguration, attributes } = req.body as Category;

        // service
        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        });

        this.logger.info(`Category ${name} created successfully`, {
            meta: {
                // in mongo we get category in this way itself.
                id: category._id,
            },
        });

        res.json({
            id: category._id,
        });
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg));
        }

        const { id } = req.params;
        const { name, priceConfiguration, attributes } = req.body as Category;

        const updatedCategoryData = await this.categoryService.update(id, {
            name,
            priceConfiguration,
            attributes,
        });

        res.json(updatedCategoryData);
    }

    async getAll(req: Request, res: Response) {
        const categories = await this.categoryService.getAll();
        res.json(categories);
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const category = await this.categoryService.getById(id);
        res.json(category);
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const deletedCategory = await this.categoryService.delete(id);
        res.json(deletedCategory);
    }
}
