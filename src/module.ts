import {Map} from 'immutable';

import {NgModule, ModuleWithProviders, OpaqueToken} from '@angular/core';
import {HttpModule} from '@angular/http';

import {Type} from 'caesium-core/lang';

import {ModelHttpModule} from './manager/http';
import {ModelManager, ManagerConfig, provideManager} from './manager/manager';
import {
    SEARCH_PAGE_QUERY_PARAM, defaultSearchPageQueryParam,
    SEARCH_PAGE_SIZE, defaultSearchPageSize
} from './manager/search';



@NgModule({
    imports: [HttpModule, ModelHttpModule]
})
export class Models {
    static provideManagers(models: [string | OpaqueToken, ManagerConfig][]): ModuleWithProviders {
        return {
            ngModule: Models,
            providers: [
                {provide: SEARCH_PAGE_QUERY_PARAM, useValue: defaultSearchPageQueryParam},
                {provide: SEARCH_PAGE_SIZE, useValue: defaultSearchPageSize},
                ...models.map(([token, config]) => provideManager(token, config))
            ]
        }
    }
}


