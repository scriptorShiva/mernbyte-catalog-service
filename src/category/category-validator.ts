import { body } from 'express-validator';

const categoryValidator = [
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

export default categoryValidator;
