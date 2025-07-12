import CategoryModel from './category-model';
import { Category } from './category-types';

export class CategoryService {
    async create(category: Category) {
        const createdCategory = new CategoryModel(category);
        return createdCategory.save();
    }

    async update(id: string, category: Category) {
        return CategoryModel.findByIdAndUpdate(id, category, { new: true }); // new true : to get the updated data
    }

    async getAll() {
        return CategoryModel.find();
    }

    async getById(id: string) {
        return CategoryModel.findById(id);
    }

    async delete(id: string) {
        return CategoryModel.findByIdAndDelete(id);
    }
}
