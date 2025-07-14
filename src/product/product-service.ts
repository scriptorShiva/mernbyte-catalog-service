import productModel from './product-model';
import { Product } from './product-types';

export class ProductService {
    // Define your service methods here

    async createProduct(product: Product) {
        const createdProduct = await productModel.create(product);
        return createdProduct;
    }

    // Partial : This is a built-in TypeScript utility type that makes all properties of a type optional.
    // new : true : This option tells Mongoose to return the updated document.
    // runValidators : This option tells Mongoose to run validation on the updated document.

    async updateProduct(id: string, productData: Partial<Product>) {
        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            productData,
            { new: true, runValidators: true },
        );
        return updatedProduct;
    }

    async getProductImageUrl(productId: string): Promise<string> {
        const product = await productModel.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        return product.image;
    }

    async getProductById(id: string): Promise<Product | null> {
        return await productModel.findOne({ _id: id });
    }
}
