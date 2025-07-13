export interface Product {
    name: string;
    description: string;
    priceConfiguration: string;
    attributes: string;
    tenantId: string;
    categoryId: string;
    image: string;
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
