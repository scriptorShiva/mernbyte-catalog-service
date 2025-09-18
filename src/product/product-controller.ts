import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

import { Logger } from 'winston';
import { ProductService } from './product-service';
import { Filter, Product } from './product-types';
import { FileStorage } from '../common/types/storage';
import { v4 as uuidV4 } from 'uuid';
import { UploadedFile } from 'express-fileupload';
import { AuthRequest } from '../common/types';
import { ROLES } from '../common/constant';
import mongoose from 'mongoose';
import { ToppingService } from '../toppings/topping-service';
import { Topping } from '../toppings/topping-types';

export class ProductController {
    // dependency injections for injecting the service. Now, whenever this controller is called, it will neet toinject the service
    constructor(
        private productService: ProductService,
        private toppingService: ToppingService, //  inject topping service
        private logger: Logger,
        // from SOLID principles, this is inversion principle
        private storage: FileStorage,
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        // Create a new product

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
            isPublished,
            toppings,
        } = req.body as Product;

        // image file
        const image = req.files!.image as UploadedFile;
        const imageName = uuidV4();

        await this.storage.upload({
            filename: imageName,
            fileData: image.data.buffer as ArrayBuffer,
        });

        // check if toppings exists
        // validate toppings is from this tenant itself.
        // also I am exporting it form tenant service because this artitecture is decoupled.
        //Your product controller does not know anything about toppings. It has no knowledge of how toppings are stored.
        // Harder to change topping logic later (e.g., caching, business rules). if we use model here, to use that method
        if (toppings && toppings.length > 0) {
            const validToppings =
                await this.toppingService.validateTenantToppings(
                    toppings,
                    tenantId,
                );
            if (!validToppings) {
                return next(createHttpError(400, 'Invalid toppings selected'));
            }
        }

        // service
        const product = await this.productService.createProduct({
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string),
            attributes: JSON.parse(attributes as string),
            tenantId,
            categoryId,
            image: imageName,
            isPublished,
            toppings,
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
            isPublished,
            toppings,
        } = req.body as Product;

        let newImageName: string | undefined;
        if (req.files?.image) {
            const oldImage = await this.productService.getProductImageUrl(id);

            const image = req.files.image as UploadedFile;
            newImageName = uuidV4();

            await this.storage.upload({
                filename: newImageName,
                fileData: image.data.buffer as ArrayBuffer,
            });

            // delete old image
            await this.storage.delete(oldImage);
        }

        let mergedToppings: string[] | undefined;
        if (toppings) {
            const validToppings =
                await this.toppingService.validateTenantToppings(
                    toppings,
                    tenantId,
                );

            if (!validToppings) {
                return next(
                    createHttpError(
                        400,
                        'Some toppings are invalid or not allowed',
                    ),
                );
            }

            // merge new toppings with existing ones
            // using set to avoid duplicates
            const existingtoppings = (product.toppings ?? []).map((t) =>
                t.toString(),
            );
            mergedToppings = [
                ...new Set([
                    ...existingtoppings,
                    ...toppings.map((t) => t.toString()),
                ]),
            ];
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
            isPublished,
        });

        if (mergedToppings) {
            updatedProduct.toppings = mergedToppings;
        }

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

    getAll = async (req: Request, res: Response) => {
        const { q, tenantId, categoryId, isPublished } = req.query as {
            q?: string;
            tenantId?: string;
            categoryId?: string;
            isPublished?: string;
        };

        const filters: Filter = {};

        // As from query params we get boolean as string
        if (isPublished == 'true') {
            filters.isPublished = true;
        }

        if (tenantId) {
            filters.tenantId = tenantId;
        }

        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
            // in filter we need to convert categoryId to ObjectId to get the products
            // this is because we are storing categoryId as ObjectId in the database
            // and we need to convert it to ObjectId to filter the products
            // if categoryId is not valid ObjectId, then we will not filter by categoryId
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }

        const products = await this.productService.getAllProducts(
            q as string,
            filters,
            {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
            },
        );

        // add image url in products from storage service
        if (!products.data || !Array.isArray(products.data)) {
            return res.json({ ...products, data: [] });
        }

        products.data.forEach((product: Product) => {
            product.imageUrl = this.storage.getObjectUri(product.image);
        });

        return res.json(products);
    };

    getById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const product = await this.productService.getProductById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // After populate, toppings is actually an array of Topping documents
        if (product.toppings && product.toppings.length > 0) {
            product.toppings.forEach((topping) => {
                // Type narrowing: only run if it's a populated Topping
                if (typeof topping !== 'string' && '_id' in topping) {
                    const t = topping as unknown as Topping;
                    t.image = this.storage.getObjectUri(t.image);
                }
            });
        }

        return res.json(product);
    };

    delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const deletedProduct = await this.productService.deleteProduct(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.json(deletedProduct);
    };
}
