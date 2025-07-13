import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

import { Logger } from 'winston';
import { ProductService } from './product-service';
import { Product } from './product-types';
import { FileStorage } from '../common/types/storage';
import { v4 as uuidV4 } from 'uuid';
import { UploadedFile } from 'express-fileupload';

export class ProductController {
    // dependency injections for injecting the service. Now, whenever this controller is called, it will neet toinject the service
    constructor(
        private productService: ProductService,
        private logger: Logger,
        // from SOLID principles, this is inversion principle
        private storage: FileStorage,
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        // Create a new product
        // todo : image upload
        // todo : save product to database
        // todo : return created product
        // todo : handle errors

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
            isPublish,
        } = req.body as Product;

        // image file
        const image = req.files!.image as UploadedFile;
        const imageName = uuidV4();

        await this.storage.upload({
            filename: imageName,
            fileData: image.data.buffer,
        });

        // service
        const product = await this.productService.createProduct({
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string),
            attributes: JSON.parse(attributes as string),
            tenantId,
            categoryId,
            image: imageName,
            isPublish,
        });

        // log the creation
        this.logger.info(`Product created with ID: ${product.id}`, {
            productId: product.id,
            tenantId: product.tenantId,
        });

        return res.json({ id: product._id });
    };
}
