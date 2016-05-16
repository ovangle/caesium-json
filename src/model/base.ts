import {ModelMetadata} from './metadata';
import {copyModel} from './factory';
import {ModelValues} from './values';

export abstract class ModelBase {
    /**
     * The server-assigned id of the model.
     */
    id: any;

    private __metadata: ModelMetadata;
    private __modelValues: ModelValues;

    /**
     * Get the value of the property `name`.
     * @param propName
     */
    get(propName: string): any {
        this.__metadata.checkHasProperty(propName);
        var accessor = this.__metadata.propertyAccessors.get(propName);
        return accessor(this.__modelValues);
    }

    /**
     * Set the value of the property `name` and return the mutated model.
     * @param propName
     * @param value
     */
    set(propName: string, value: any): ModelBase /* typeof this */{
        this.__metadata.checkHasProperty(propName);
        return copyModel(this, [{property: propName, value: value}]);
    }
}


