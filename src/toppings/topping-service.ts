import toppingModel from './topping-model';
import { Topping } from './topping-types';

export class ToppingService {
    async create(topping: Topping) {
        return await toppingModel.create(topping);
    }

    async updateTopping(id: string, toppingData: Partial<Topping>) {
        const updatedTopping = await toppingModel.findByIdAndUpdate(
            id,
            toppingData,
            // new true : to get the updated data
            // runValidators : to validate the data
            { new: true, runValidators: true },
        );
        return updatedTopping;
    }

    async getToppingById(id: string) {
        return await toppingModel.findById(id);
    }

    async getAll(tenantId: string) {
        return await toppingModel.find({ tenantId });
    }

    async deleteTopping(id: string) {
        return await toppingModel.findByIdAndDelete(id);
    }
}
