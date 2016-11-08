import {Map} from 'immutable';

import {NgModule, ModuleWithProviders} from '@angular/core';
import {HttpModule} from '@angular/http';

import {Type} from 'caesium-core/lang';

import {ModelTypes} from './model/model_types';
import {ModelHttp} from './manager/model_http';
import {ManagerOptions} from "./manager/base";

@NgModule({
    imports: [HttpModule]
})
export class Models {
    static forRoot(types: Type[]): ModuleWithProviders {
        return {
            ngModule: Models,
            providers: [
                ModelTypes,
                ModelHttp,
                ManagerOptions
            ]
        }
    }
}


