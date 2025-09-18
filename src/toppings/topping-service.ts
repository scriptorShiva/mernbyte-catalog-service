import mongoose from 'mongoose';
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

    async validateTenantToppings(
        toppings: (string | mongoose.Types.ObjectId)[], //Mongoose’s ObjectId is an object, not a string
        tenantId: string,
    ) {
        const validToppings = await toppingModel.find({
            _id: { $in: toppings },
            tenantId,
        });

        if (validToppings.length !== toppings.length) {
            return null; // invalid selection
        }

        return validToppings;
    }
}
