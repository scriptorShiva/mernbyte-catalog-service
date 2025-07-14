import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

import { Logger } from 'winston';
import { ProductService } from './product-service';
import { Product } from './product-types';
import { FileStorage } from '../common/types/storage';
import { v4 as uuidV4 } from 'uuid';
import { UploadedFile } from 'express-fileupload';
import { AuthRequest } from '../common/types';
import { ROLES } from '../common/constant';

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

    update = async (req: Request, res: Response, next: NextFunction) => {
        // Update an existing product
        // todo : image upload
        // todo : save product to database
        // todo : return updated product
        // todo : handle errors

        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg));
        }

        const { id } = req.params;

        // check if tenant has access to the product
        const product = await this.productService.getProductById(id);
        if (!product) {
            return next(createHttpError(404, 'Product not found'));
        }

        // if user is not admin, then check if tenant has access to the product
        if ((req as AuthRequest).auth.role !== ROLES.ADMIN) {
            const tenant = (req as AuthRequest).auth?.tenant;
            // check if tenant has access to the product
            if (product.tenantId !== String(tenant)) {
                return next(createHttpError(403, 'Access denied'));
            }
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

        let newImageName: string | undefined;
        if (req.files?.image) {
            const oldImage = await this.productService.getProductImageUrl(id);

            const image = req.files.image as UploadedFile;
            newImageName = uuidV4();

            await this.storage.upload({
                filename: newImageName,
                fileData: image.data.buffer,
            });

            // delete old image
            await this.storage.delete(oldImage);
        }

        const updatedProduct = await this.productService.updateProduct(id, {
            name,
            description,
            priceConfiguration:
                priceConfiguration && JSON.parse(priceConfiguration as string),
            attributes: attributes && JSON.parse(attributes as string),
            tenantId,
            categoryId,
            image: newImageName,
            isPublish,
        });

        if (!updatedProduct) {
            return next(createHttpError(404, 'Unable to update product'));
        }

        // log the update
        this.logger.info(`Product updated with ID: ${updatedProduct.id}`, {
            productId: updatedProduct.id,
            tenantId: updatedProduct.tenantId,
        });

        return res.json(updatedProduct);
    };
}
