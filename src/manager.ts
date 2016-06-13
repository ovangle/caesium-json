import {HTTP_PROVIDERS} from '@angular/http';
import {ModelHttp} from './manager/model_http';
import {ManagerOptions} from './manager/base';

export {ModelHttp, API_HOST_HREF} from './manager/model_http';
export {Get, Put, Post, Delete} from './manager/request';
export {
    Search, SearchParameter, SearchResult, SEARCH_PAGE_SIZE, SEARCH_PAGE_QUERY_PARAM
} from './manager/search';
export {ManagerBase, ManagerOptions} from './manager/base';

export const MANAGER_PROVIDERS = [
    HTTP_PROVIDERS,
    ModelHttp,
    ManagerOptions
];

