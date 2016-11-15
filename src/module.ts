import {Map} from 'immutable';

import {NgModule, ModuleWithProviders} from '@angular/core';
import {HttpModule} from '@angular/http';

import {Type} from 'caesium-core/lang';

import {ModelTypes} from './model/model_types';
import {ModelHttpModule} from './manager/http';
import {ManagerOptions} from "./manager/base";

@NgModule({
    imports: [HttpModule, ModelHttpModule]
})
export class Models {
    static forRoot(types: Type[]): ModuleWithProviders {
        return {
            ngModule: Models,
            providers: [
                ModelTypes,
                ManagerOptions
            ]
        }
    }
}


