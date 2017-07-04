import { Converter } from 'caesium-core/converter';
export declare type Matcher = (modelValue: any, paramValue: any) => boolean;
export declare type Refiner = (currentParamValue: any, previousParamValue: any) => boolean;
export interface SearchParameter {
    name: string;
    encoder: Converter<any, string>;
    accessor?: (model: any) => any;
    matcher?: Matcher;
    refiner?: Refiner;
}
