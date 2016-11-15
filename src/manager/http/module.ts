import {OpaqueToken, NgModule} from '@angular/core';
import {HttpModule, Http, RequestOptions, Headers} from '@angular/http';


import {RequestFactory} from './request_factory';

@NgModule({
    imports: [
        HttpModule
    ],
    providers: [
        RequestFactory
    ]
})
export class ModelHttpModule {}
