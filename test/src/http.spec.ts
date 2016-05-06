import {abstractRequestTests} from './http/abstract_request.spec';
import {deleteRequestTests} from './http/delete_request.spec';
import {getRequestTests} from './http/get_request.spec';
import {interfacesTests} from './http/interfaces.spec';
import {modelHttpTests} from './http/model_http.spec';
import {postRequestTests} from './http/post_request.spec';
import {putRequestTests} from './http/put_request.spec';
import {searchRequestTests} from './http/search_request.spec';

export function httpTests() {
    describe('http', () => {
        abstractRequestTests();
        deleteRequestTests();
        getRequestTests();
        interfacesTests();
        modelHttpTests();
        postRequestTests();
        putRequestTests();
        searchRequestTests();
    });
}
