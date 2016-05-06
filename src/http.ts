import {HTTP_PROVIDERS} from 'angular2/http';
import {ModelHttp} from './http/model_http';

export {ModelHttp, API_HOST_HREF} from './http/model_http';

export {BaseRequestOptions, SingleItemResponse} from './http/interfaces';

export {GetOptions, Get} from './http/get_request';
export {PutOptions, Put} from './http/put_request';
export {PostOptions, Post} from './http/post_request';
export {DeleteOptions, Delete} from './http/delete_request';
export {SearchOptions, Search} from './http/search_request';

export const MODEL_HTTP_PROVIDERS = [
    HTTP_PROVIDERS,
    ModelHttp   
];

