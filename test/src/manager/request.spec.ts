
import {getTests} from "./request/get.spec";
import {deleteTests} from "./request/delete.spec";
import {factoryTests} from "./request/factory.spec";
import {postTests} from "./request/post.spec";
import {putTests} from "./request/put.spec";
import {responseTests} from "./request/response.spec";


export function requestTests() {
    deleteTests();
    factoryTests();
    getTests();
    postTests();
    putTests();
    responseTests();
}
