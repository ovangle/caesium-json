import {Model, Property} from '../../src/model/decorators';
import {ModelBase} from '../../src/model/base';

import {str} from '../../src/json_codecs';

import * as Test from './models';

@Model({kind: 'test::ExistingPropertyName'})
export class ExistingPropertyName extends ModelBase {
    get existingProperty() { return 'the existing property'; }

    constructor(
        id: number,
        @Property('existingProperty', {codec: str})
            existingProperty: string
    ) {
        super(id, existingProperty);
    }
}

describe('model.type_proxy', () => {
    it('should not overwrite an existing property of the class', () => {
        let foo = new ExistingPropertyName(null, 'overwritten by the property descriptor');
        expect(foo.existingProperty).toBe('the existing property');
    });
});
