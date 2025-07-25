import { body } from 'express-validator';

export const createToppingValidator = [
    body('name')
        .exists()
        .withMessage('Topping name is required')
        .isString()
        .withMessage('Topping name should be a string'),
    body('price').exists().withMessage('Price is required'),
    body('image').custom((value, { req }) => {
        if (value) return true;
        if (!req.files) throw new Error('Topping image is required');
        return true;
    }),
    body('tenantId').exists().withMessage('Tenant Id is required'),
];

export const updateToppingValidator = [
    body('name')
        .optional()
        .isString()
        .withMessage('Topping name should be a string'),
    body('price').optional(),
    body('image').optional(),
    body('tenantId').optional(),
];
