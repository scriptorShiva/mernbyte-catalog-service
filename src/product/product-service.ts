/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose';
import { paginationLabels } from '../config/pagination';
import productModel from './product-model';
import { Filter, PaginateQuery, Product } from './product-types';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

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
        return await productModel.findOne({ _id: id }).populate('toppings');
    }

    async getAllProducts(
        q?: string,
        filters: Filter = {},
        paginateQuery: PaginateQuery = {},
    ) {
        // here we have to implement different filters , search and pagination , sorting
        // for all that in mongoose we have aggregate pipelines for that.. we have to prepare our query params

        const searchQueryRegexp = new RegExp(q ?? '', 'i'); // 'i' for case-insensitive search

        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };

        // aggregate pipeline : pipeling means it accepts array of objects.
        const aggregate = productModel.aggregate([
            {
                $match: matchQuery,
            },
            // we want to get category relation
            {
                $lookup: {
                    // from : this is the collection name
                    from: 'categories',
                    // localField : this is the field in product collection (Fk key)
                    localField: 'categoryId',
                    // foreignField : this is the field in category collection (PK key)
                    foreignField: '_id',
                    // as : this is the alias for category
                    as: 'category',

                    // pipeline : this is the pipeline for category ,
                    pipeline: [
                        {
                            // $project : this is the projection operator
                            $project: {
                                // properties we want to project
                                name: 1,
                                description: 1,
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                // $unwind : this is the unwind operator : this is used to flatten the array
                $unwind: '$category',
            },
        ]);

        // With Pagination we will not return this in this way
        // const result = await aggregate.exec();
        // return result as Product[];

        // With Pagination we will return this way.
        return productModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }

    async deleteProduct(id: string) {
        const deletedProduct = await productModel.findByIdAndDelete(id);
        return deletedProduct;
    }
}
