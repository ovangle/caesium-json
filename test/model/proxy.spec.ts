import {Model, Property} from '../../src/model/decorators';
import {ModelBase} from '../../src/model/base';

import {str} from '../../src/json_codecs/index';

import * as Test from './models';

@Model({kind: 'test::ExistingPropertyName'})
export class ExistingPropertyName extends ModelBase {
    get existingProperty() { return 'the existing property'; }

    constructor(
        @Property('existingProperty', {codec: str})
        existingProperty: string
    ) {
        super(existingProperty);
    }
}

describe('model.type_proxy', () => {
    it('should not overwrite an existing property of the class', () => {
        let foo = new ExistingPropertyName('overwritten by the property descriptor');
        expect(foo.existingProperty).toBe('the existing property');
    });
});
