import {List} from 'immutable';
import {Type} from 'caesium-core/lang';

import {Model, Property, RefProperty} from '../../src/model/decorators';
import {ModelBase} from '../../src/model/base';

import {str, num, bool} from '../../src/json_codecs';

@Model({kind: 'model::ModelNoProperties'})
export class ModelNoProperties extends ModelBase {
    static constructorRunCount = 0;

    constructor(id: number) {
        super(id);
        ModelNoProperties.constructorRunCount++;
    }
}

@Model({kind: 'model::ModelSubtype'})
export class ModelSubtype extends ModelNoProperties {
    static constructorCount = 0;

    constructor(id: number) {
        super(id);

        //console.log('Super returns', s);
        //ModelSubtype.constructorCount += 1;
    }

    foo(arg: any) {
        return arg;
    }
}

@Model({kind:'model::ModelOneProperty'})
export class ModelOneProperty extends ModelBase {
    static create(args: {prop?: ModelNoProperties}) : ModelOneProperty {
        return <ModelOneProperty>modelFactory(ModelOneProperty)(args);
    }

    constructor(
        public id: number,
        @Property('prop', {codec: str}) public prop: string,
        ...args: any[] // Subtype arguments.
    ) {
        super(id, prop, ...args);
    }
}

@Model({kind: 'model::OnePropertySubtype', superType: ModelOneProperty})
export class OnePropertySubtype extends ModelOneProperty {
    constructor(
        public id: number,
        @Property('newProp', {codec: str}) public newProp: string,
    ) {
        super(id, newProp);
    }
}

@Model({kind: 'model::ModelTwoProperties'})
export class ModelTwoProperties extends ModelBase {
    constructor(
        public id: number,
        @Property('propOne', {codec: str}) public propOne: string,
        @Property('propTwo', {codec: str}) public propTwo: string
    ) {
        super(id, propOne, propTwo);
    }
}

//TODO: This needs to happen
export function modelFactory<T>(type: Type): (args: {[prop: string]: any}) => T {
    return;
}

@Model({kind: 'model::ModelOneRefProperty'})
export class ModelOneRefProperty extends ModelBase {
    static create(args: {prop?: ModelNoProperties}): ModelOneRefProperty {
        return <ModelOneRefProperty>modelFactory(ModelOneRefProperty)(args);
    }

    //FIXME: Should be constructor(@Property(ModelNoProperties) public prop: Observable<ModelNoProperties>
    private constructor(
        public id: number,
        @RefProperty('propId', {refType: ModelNoProperties, refName: 'prop'})
        public propId: number,
    ) {
        super(id, propId);
    }
}

@Model({kind: 'model::OneMultiRefProperty'})
export class OneMultiRefProperty extends ModelBase {
    constructor(
        public id: number,
        @RefProperty('multiPropId', {refType: ModelNoProperties, refName: 'multiProp', isMulti: true})
        public multiPropId: List<number>
    ) {
        super(id, multiPropId);
    }
}

@Model({kind: 'model::ModelMixedProperties'})
export class ModelMixedProperties extends ModelBase {
    private constructor(
        id: number,
        @RefProperty('propOne', {refType: ModelNoProperties, refName: 'propOne'})
        public propOne: number,
        @Property('propTwo',{codec: str})
        public propTwo: String,
        @Property('propThree', {codec: str})
        public propThree: String,
        @RefProperty('propFour', {refType: ModelSubtype, refName: 'propFour'})
        public propFour: number
    ) {
        super(id, propOne, propTwo, propThree, propFour);
    }
}



