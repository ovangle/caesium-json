import {isBlank} from 'caesium-core/lang';

export type JsonObject = { [attr: string]: any};
export type StringMap = { [attr: string]: string };

export interface JsonQuery {
    /// An array of items contained in the response of the query
    items: JsonObject[];

    pageId: number;
    lastPage: boolean;
}

//FIXME: These should be defined in caesium-core/lang
export function isArray(obj: any) {
    return Array.isArray(obj);
}

export function isNumber(obj) {
    return typeof obj === "number";
}

export function isBoolean(obj) {
    return typeof obj === "boolean";
}


export function isJsonQuery(obj: any): boolean {
    return !isBlank(obj)
        && isArray(obj.items)
        && isNumber(obj.pageId)
        && isBoolean(obj.lastPage);
}



