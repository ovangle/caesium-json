///<reference path="../typings/es6-shim/es6-shim.d.ts"/>
///<reference path="../typings/jasmine/jasmine.d.ts"/>
///<reference path="../node_modules/zone.js/dist/zone.js.d.ts"/>

import 'reflect-metadata';

import {setBaseTestProviders} from "@angular/core/testing";
import {
    TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
    TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS
} from "@angular/platform-browser-dynamic/testing/browser";

import {exceptionsTests} from './src/exceptions.spec';
import {managerTests} from "./src/manager.spec";
import {jsonCodecsTests} from "./src/json_codecs.spec";
import {modelTests} from './src/model.spec';

setBaseTestProviders(
    TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
    TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS
);

exceptionsTests();
jsonCodecsTests();
modelTests();
managerTests();

