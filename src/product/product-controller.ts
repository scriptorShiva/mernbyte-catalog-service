import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

import { Logger } from 'winston';
import { ProductService } from './product-service';
import { Product } from './product-types';

export class ProductController {
    // dependency injections for injecting the service. Now, whenever this controller is called, it will neet toinject the service
    constructor(
        private productService: ProductService,
        private logger: Logger,
    ) {}

    // Create a new product
    // todo : image upload
    // todo : save product to database
    // todo : return created product
    // todo : handle errors

    create = async (req: Request, res: Response, next: NextFunction) => {
        // 1. get validation result : as we have used validation middleware
        const result = validationResult(req);

        // if result is not empty : means we have any error then send error to global error handler
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg));
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            image,
        } = req.body as Product;

        // service
        const product = await this.productService.createProduct({
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string),
            attributes: JSON.parse(attributes as string),
            tenantId,
            categoryId,
            image: 'image.url',
        });

        // log the creation
        this.logger.info(`Product created with ID: ${product.id}`, {
            productId: product.id,
            tenantId: product.tenantId,
        });

        return res.json({ id: product._id });
    };
}
