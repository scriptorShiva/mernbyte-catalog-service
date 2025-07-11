// how will data look like
export interface Category {
    name: string;
    priceConfiguration: PriceConfiguration;
    attributes: Attributes[];
}

export interface PriceConfiguration {
    [Key: string]: {
        priceType: 'base' | 'additional';
        availableOptions: string[];
    };
}

export interface Attributes {
    name: string;
    widgetType: 'switch' | 'radio' | 'select';
    defaultValue: string;
    availableOptions: string[];
}
