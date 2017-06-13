import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {ModelHttp} from './manager/model_http';
import {ManagerOptions} from './manager/base';

export {ModelHttp, API_HOST_HREF} from './manager/model_http';
export {Get, Put, Post, Delete} from './manager/request';
export {
    Search, SearchParameter, SearchResult, SEARCH_PAGE_SIZE, SEARCH_PAGE_QUERY_PARAM
} from './manager/search';
export {ManagerBase, ManagerOptions} from './manager/base';

@NgModule({
    imports: [
        HttpModule
    ],
    providers: [
        ModelHttp,
        ManagerOptions
    ]
})
export class ManagerModule {

}

