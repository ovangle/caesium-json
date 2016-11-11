import {BaseException} from '../exceptions';

import {Type} from 'caesium-core/lang';

export class ModelNotFoundException extends BaseException {
    constructor(public type: Type) {
        super('The given type was not an @Model annotated instance');
    }

}
