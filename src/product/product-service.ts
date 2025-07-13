import productModel from './product-model';
import { Product } from './product-types';

export class ProductService {
    // Define your service methods here

    async createProduct(product: Product) {
        const createdProduct = await productModel.create(product);
        return createdProduct;
    }
}
