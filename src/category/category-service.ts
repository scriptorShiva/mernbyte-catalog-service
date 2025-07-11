import CategoryModel from './category-model';
import { Category } from './category-types';

export class CategoryService {
    async create(category: Category) {
        const createdCategory = new CategoryModel(category);
        return createdCategory.save();
    }
}
