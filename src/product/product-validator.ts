import { body } from 'express-validator';

export const productCreateValidator = [
    body('name')
        .exists()
        .withMessage('Product name is required')
        .isString()
        .withMessage('Product name must be a string'),

    body('description')
        .exists()
        .withMessage('Product description is required')
        .isString()
        .withMessage('Product description must be a string'),

    body('priceConfiguration')
        .exists()
        .withMessage('priceConfiguration is required'),

    body('attributes').exists().withMessage('attributes is required'),

    body('tenantId')
        .exists()
        .withMessage('tenantId is required')
        .isString()
        .withMessage('tenantId must be a string'),

    body('categoryId')
        .exists()
        .withMessage('categoryId is required')
        .isString()
        .withMessage('categoryId must be a string'),

    body('image').custom((value, { req }) => {
        if (value && typeof value !== 'string') {
            throw new Error('Image must be a string');
        }

        if (!req.files!.image) {
            throw new Error('Image file is required');
        }

        if (!req.files!.image.mimetype.startsWith('image/')) {
            throw new Error('Uploaded file must be an image');
        }
        return true;
    }),
];

export const productUpdateValidator = [
    body('name')
        .optional()
        .isString()
        .withMessage('Product name must be a string'),

    body('description')
        .optional()
        .isString()
        .withMessage('Product description must be a string'),

    body('priceConfiguration').optional(),

    body('attributes').optional(),

    body('tenantId')
        .optional()
        .isString()
        .withMessage('tenantId must be a string'),

    body('categoryId')
        .optional()
        .isString()
        .withMessage('categoryId must be a string'),

    body('image')
        .custom((value, { req }) => {
            if (value && typeof value !== 'string') {
                throw new Error('Image must be a string');
            }

            if (!req.file) {
                throw new Error('Image file is required');
            }
            return true;
        })
        .optional(),
];
