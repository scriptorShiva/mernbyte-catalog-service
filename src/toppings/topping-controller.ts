import { NextFunction, Response, Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import { FileStorage } from '../common/types/storage';
import { ToppingService } from './topping-service';
import { Topping } from './topping-types';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { Logger } from 'winston';
import { AuthRequest } from '../common/types';
import { ROLES } from '../common/constant';

export class ToppingController {
    constructor(
        private storage: FileStorage,
        private toppingService: ToppingService,
        private logger: Logger,
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get validation result : as we have used validation middleware
            const result = validationResult(req);

            // if result is not empty : means we have any error then send error to global error handler
            if (!result.isEmpty()) {
                return next(createHttpError(400, result.array()[0].msg));
            }

            const { name, price, tenantId } = req.body as Topping;

            const image = req.files!.image as UploadedFile;
            const fileUuid = uuidv4();

            await this.storage.upload({
                filename: fileUuid,
                fileData: image.data.buffer,
            });

            const savedTopping = await this.toppingService.create({
                name,
                price,
                image: fileUuid,
                tenantId,
                isPublish: false,
            } as Topping);

            this.logger.info(
                `Topping ${savedTopping.name} created successfully`,
            );

            res.json({ id: savedTopping._id });
        } catch (err) {
            return next(err);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return next(createHttpError(400, result.array()[0].msg));
            }

            const { id } = req.params;
            const { name, price, tenantId, isPublish } = req.body as Topping;

            // check if tenant has access to the topping
            const topping = await this.toppingService.getToppingById(id);
            if (!topping) {
                return next(createHttpError(404, 'Topping not found'));
            }

            // if user is not admin, then check if tenant has access to the topping
            if ((req as AuthRequest).auth.role !== ROLES.ADMIN) {
                const tenant = (req as AuthRequest).auth?.tenant;
                // check if tenant has access to the topping
                if (topping.tenantId !== String(tenant)) {
                    return next(createHttpError(403, 'Access denied'));
                }
            }

            let newImageName: string | undefined;
            if (req.files?.image) {
                const oldImage = topping.image;

                const image = req.files.image as UploadedFile;
                newImageName = uuidv4();

                await this.storage.upload({
                    filename: newImageName,
                    fileData: image.data.buffer,
                });

                // delete old image
                await this.storage.delete(oldImage);
            }

            const updatedTopping = await this.toppingService.updateTopping(id, {
                name,
                price,
                tenantId,
                isPublish,
                image: newImageName,
            });

            res.json(updatedTopping);
        } catch (err) {
            return next(err);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const toppings = await this.toppingService.getAll(
                req.query.tenantId as string,
            );

            const readyToppings = toppings.map((topping) => {
                return {
                    id: topping._id,
                    name: topping.name,
                    price: topping.price,
                    isPublish: topping.isPublish,
                    tenantId: topping.tenantId,
                    image: this.storage.getObjectUri(topping.image),
                };
            });
            res.json({
                data: readyToppings,
            });
        } catch (err) {
            return next(err);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const topping = await this.toppingService.getToppingById(id);
            if (!topping) {
                return next(createHttpError(404, 'Topping not found'));
            }
            res.json({
                id: topping._id,
                name: topping.name,
                price: topping.price,
                tenantId: topping.tenantId,
                isPublish: topping.isPublish,
                image: this.storage.getObjectUri(topping.image),
            });
        } catch (err) {
            return next(err);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const topping = await this.toppingService.getToppingById(id);
            if (!topping) {
                return next(createHttpError(404, 'Topping not found'));
            }
            await this.toppingService.deleteTopping(id);
            res.json({ message: 'Topping deleted successfully' });
        } catch (err) {
            return next(err);
        }
    };
}
