import {Map} from 'immutable';

import {NgModule, ModuleWithProviders, OpaqueToken} from '@angular/core';
import {HttpModule} from '@angular/http';

import {Type} from 'caesium-core/lang';

import {ModelMetadata} from './model/metadata';
import {MetadataProvider, provideTypeMetadata, AbstractTypeConfig} from './model/metadata_provider';

import {ModelHttpModule} from './manager/http';
import {ModelManager} from './manager/manager';
import {
    SEARCH_PAGE_QUERY_PARAM, defaultSearchPageQueryParam,
    SEARCH_PAGE_SIZE, defaultSearchPageSize
} from './manager/search';

@NgModule({
    imports: [HttpModule, ModelHttpModule]
})
export class Models {
    /**
     * Validate the given model types, and their nested types if necessary.
     * Only managed models need to be registered.
     *
     * @param types
     */
    static provideMetadata(types: (Type | AbstractTypeConfig)[]): ModuleWithProviders {
        return {
            ngModule: Models,
            providers: [
                provideTypeMetadata(types),
                MetadataProvider,
                {provide: SEARCH_PAGE_SIZE, useValue: defaultSearchPageSize},
                {provide: SEARCH_PAGE_QUERY_PARAM, useValue: defaultSearchPageQueryParam},
                ModelManager
            ]
        }
    }
}


