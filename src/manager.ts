import {HTTP_PROVIDERS} from 'angular2/http';
import {ModelHttp} from './manager/model_http';
import {ManagerOptions} from './manager/base';

export {ModelHttp, API_HOST_HREF} from './manager/model_http';
export {Get, Put, Post, Delete} from './manager/request';
export {Search, SearchParameter, SearchResult, SEARCH_PAGE_SIZE} from './manager/search'; 
export {ManagerBase, ManagerOptions} from './manager/base';

export const MANAGER_PROVIDERS = [
    HTTP_PROVIDERS,
    ModelHttp,
    ManagerOptions
];

