import mongoose from 'mongoose';

export interface Product {
    name: string;
    description: string;
    priceConfiguration: string;
    attributes: string;
    tenantId: string;
    categoryId: string;
    image: string;
    isPublish?: boolean;
}

export interface ProductUpdate {
    name?: string;
    description?: string;
    priceConfiguration?: {
        basePrice?: number;
        additionalPrices?: { type: string; price: number }[];
    };
    attributes?: Record<string, any>;
    image?: string;
}

export type Filter = {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublish?: boolean;
};
