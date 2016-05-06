export type JsonObject = { [attr: string]: any};
export type StringMap = { [attr: string]: string };

export interface JsonQuery {
    /// An array of items contained in the response of the query
    items: JsonObject[];

    pageId: number;
    lastPage: boolean;
}



