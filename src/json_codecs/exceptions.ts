import {Exception} from 'caesium-core/exception';

export class EncodingException extends Exception {
    toString() { return `EncodingException: ${this.message}` }
}
