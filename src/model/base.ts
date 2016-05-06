import {ModelMetadata} from './metadata';
import {copyModel} from './factory';

export abstract class ModelBase {
    private get __metadata() {
        return ModelMetadata.forInstance(this);
    }

    /**
     * Get the value of the property `name`.
     * @param propName
     */
    get(propName: string): any {
        this.__metadata.checkHasProperty(propName);
        return (this as any)[propName];
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


