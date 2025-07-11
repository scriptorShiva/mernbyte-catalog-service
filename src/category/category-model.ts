import mongoose from 'mongoose';

// how will data look like
export interface Category {
    name: string;
    priceConfiguration: PriceConfiguration;
    attributes: Attributes[];
}

interface PriceConfiguration {
    [Key: string]: {
        priceType: 'base' | 'additional';
        availableOptions: string[];
    };
}

interface Attributes {
    name: string;
    widgetType: 'switch' | 'radio' | 'select';
    defaultValue: string;
    availableOptions: string[];
}

// Mongoose model structure

// One way of doing it but instead we create differnt schema for each and embedd it in the main schema
// const categorySchema = new mongoose.Schema<Category>({
//     name: {
//         type: String,
//         required: true,
//     },
//     priceConfiguration: {
//         type: Object,
//         required: true,
//     },
//     attributes: {
//         type: Array,
//         required: true,
//     },
// });

const priceConfigurationSchema = new mongoose.Schema<PriceConfiguration>({
    priceType: {
        type: String,
        enum: ['base', 'additional'],
        required: true,
    },
    availableOptions: {
        type: [String],
        required: true,
    },
});

const AttributesSchema = new mongoose.Schema<Attributes>({
    name: {
        type: String,
        required: true,
    },
    widgetType: {
        type: String,
        enum: ['switch', 'radio', 'select'],
        required: true,
    },
    defaultValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    availableOptions: {
        type: [String],
        required: true,
    },
});

const categorySchema = new mongoose.Schema<Category>({
    name: {
        type: String,
        required: true,
    },
    priceConfiguration: {
        type: Map,
        of: priceConfigurationSchema, // we want it {size : {priceType, availableOptions}} in this way.
        required: true,
    },
    attributes: {
        type: [AttributesSchema],
        required: true,
    },
});

export default mongoose.model('Category', categorySchema); // --> Collection will create in plural form.
