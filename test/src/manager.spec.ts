import {managerBaseTests} from './manager/base.spec';
import {modelHttpTests} from "./manager/model_http.spec";
import {requestTests} from "./manager/request.spec";
import {searchTests} from "./manager/search.spec";

export function managerTests() {
    describe('manager', () => {
        managerBaseTests();
        modelHttpTests();
        requestTests();
        searchTests();
    });
}
