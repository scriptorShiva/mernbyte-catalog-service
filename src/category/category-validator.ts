import { body } from 'express-validator';

export const categoryCreateValidator = [
    body('name')
        .exists()
        .withMessage('Category name is required')
        .isString()
        .withMessage('Category name must be a string'),

    body('priceConfiguration')
        .exists()
        .withMessage('priceConfiguration is required'),
    body('priceConfiguration.*.priceType')
        .exists()
        .withMessage('priceType is required')
        .custom((value: 'base' | 'additional') => {
            const validKeys = ['base', 'additional'];
            if (validKeys.includes(value)) {
                return true;
            }
            throw new Error(
                `${value} is invalid attribute for priceType. It must be one of ${validKeys.join(
                    ', ',
                )}`,
            );
        }),
    body('attributes').exists().withMessage('attributes is required'),
];

export const categoryUpdateValidator = [
    body('name')
        .optional()
        .isString()
        .withMessage('Category name must be a string'),

    body('priceConfiguration').optional(),

    body('priceConfiguration.*.priceType')
        .optional()
        .custom((value: 'base' | 'additional') => {
            const validKeys = ['base', 'additional'];
            if (validKeys.includes(value)) {
                return true;
            }
            throw new Error(
                `${value} is invalid attribute for priceType. It must be one of ${validKeys.join(
                    ', ',
                )}`,
            );
        }),

    body('attributes').optional(),
];
