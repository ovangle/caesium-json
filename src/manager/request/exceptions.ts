import {Exception} from 'caesium-core/exception';

export class StateException extends Exception {
    toString() { return 'StateException: ' + this.message; }
}
