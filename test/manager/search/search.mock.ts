import {Subscription} from 'rxjs/Subscription';
import {List} from 'immutable';


import {identityConverter} from 'caesium-core/converter';

import {Search, SearchResult} from '../../../src/manager/search';

import {ModelMetadata} from '../../../src/model/metadata';

import {SearchParameter} from "../../../src/manager/search/parameter";
import {SearchParameterMap} from '../../../src/manager/search/parameter_map';
import {RequestFactory} from "../../../src/manager/http/request_factory";

/**
 * Used for testing SearchResult.
 */
export class MockSearch extends Search<{a: string}> {
    kind:string = 'test::TestModel';

    constructor(request:RequestFactory, parameters: SearchParameter[]) {
        super(request, ['path', 'to', 'search'], parameters, identityConverter, 2, 'p');
    }

    getParamValue(param:string, notSetValue?:any):any {
        throw 'getParamValue not implemented'
    }

    hasParamValue(param:string):boolean {
        throw 'hasParamValue not implemented';
    }

    deleteParamValue(param:string):void {
        throw 'deleteParamValue not implemented';
    }

    setParamValue(param:string, value:any):void {
        throw 'setParamValue not implemented';
    }

    dispose():any {
        throw 'dispose not implemented';
    }

    protected _rebuildResponseStack(params:SearchParameterMap):any {
        throw 'rebuildResponseStack not implemented';
    }

    updateResult(result:SearchResult<{a:string}>):SearchResult<{a:string}> {
        return result;
    }
}
