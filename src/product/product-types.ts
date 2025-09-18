import mongoose from 'mongoose';
import { Types } from 'mongoose';

export interface Product {
    name: string;
    description: string;
    priceConfiguration: string;
    attributes: string;
    tenantId: string;
    categoryId: string;
    image: string;
    toppings?: Types.ObjectId[]; // Array of topping IDs
    isPublished?: boolean;
    imageUrl?: string;
}

export interface ProductUpdate {
    name?: string;
    description?: string;
    priceConfiguration?: {
        basePrice?: number;
        additionalPrices?: { type: string; price: number }[];
    };
    attributes?: string;
    image?: string;
}

export type Filter = {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublished?: boolean;
};

export type PaginateQuery = {
    page?: number;
    limit?: number;
};
