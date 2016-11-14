import {List} from 'immutable';

import {forwardRef} from '@angular/core';

import {Type} from 'caesium-core/lang';


import {createModelFactory, ModelFactory} from '../../src/model/factory';
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


@Model({kind: 'model::ModelSupertype', isAbstract: true})
export class ModelSupertype extends ModelBase {
    constructor(id: number) {
        super(id);
    }
}

@Model({kind: 'model::ModelSubtype', superType: ModelSupertype})
export class ModelSubtype extends ModelSupertype {

    static create = createModelFactory(forwardRef(() => ModelSubtype));

    constructor(id: number) {
        super(id);
    }

    foo(arg: any) {
        return arg;
    }
}

@Model({kind:'model::ModelOneProperty'})
export class ModelOneProperty extends ModelBase {
    static create(args: {prop?: ModelNoProperties}): ModelOneProperty {
        return <ModelOneProperty>createModelFactory(ModelOneProperty)(args);
    }

    constructor(
        public id: number,
        @Property('prop', {codec: str}) public prop: string,
        ...args: any[] // Subtype arguments.
    ) {
        super(id, prop, ...args);
    }
}


@Model({kind:'model::OneSuepertypeProperty', isAbstract: true})
export class OneSupertypeProperty extends ModelBase {
    static create(args: {prop?: ModelNoProperties}): ModelOneProperty {
        return <ModelOneProperty>createModelFactory(ModelOneProperty)(args);
    }

    constructor(
        public id: number,
        @Property('prop', {codec: str}) public prop: string,
        ...args: any[] // Subtype arguments.
    ) {
        super(id, prop, ...args);
    }
}

@Model({kind: 'model::OnePropertySubtype', superType: OneSupertypeProperty})
export class OneSubtypeProperty extends OneSupertypeProperty {
    constructor(
        id: number, prop: string,
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

@Model({kind: 'model::ModelOneRefProperty'})
export class ModelOneRefProperty extends ModelBase {
    // static create(args: {prop?: ModelNoProperties}): ModelOneRefProperty {
    //     return <ModelOneRefProperty>modelFactory(ModelOneRefProperty)(args);
    // }

    // Alternately
    //  static create: ModelFactory<T> = modelFactory(ModelOneProperty);

    //FIXME: Should be constructor(@Property(ModelNoProperties) public prop: Observable<ModelNoProperties>
    private constructor(
        public id: number,
        @RefProperty('propId', {refType: ModelNoProperties, refName: 'prop'})
        public propId: number,
    ) {
        super(id, propId);
    }
}

// TODO: This is the desired form for References
// @Model({
//      key: 'id', // The property which holds the ID
//      references: {
//          toSelf: SELF_REFERENCE, // A special marker which represents a relation to the same type.
//          parent: ReferencedProperty, // Short hand for a one-to-one foreign key to another model.
//          (also  parent: {target: ReferencedProperty} would be equivalent)

//          // If collectionCtor is provided, the function is used to construct instances of the type.
//          // Supported constructors are:
//          //      - Array or Set from JS core.
//          //      - Any type that extends Iterable.Indexed
//          // And eventually should support:
//          //      - Any type that extends PagedCursor

//          children: {target: ReferencedProperty, collectionCtor: List},
//          foreigners: {target: ReferencedProperty, collectionCtor: PagedCursor<ReferencedProperty>
//      }
// })
// export class ReferenceModel extends ModelBase {
//      private constructor(
//          @Property('id') public id: Number,
//          @Property('self') public self$: Observable<ReferenceModel>,
//          @Property('parent') public parent$: Observable<ReferencedProperty>,
//          @Property('children') public children$: Observable</* (Cursor | List | Set)<ReferencedModel> */>,
//          @Property('foreigner') public streamed$: PagedCursor<ReferencedProperty>
//      ) { }
//
//      //To obtain access to the '_id' property of a

//
//
// }
//



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
        public propOne: number = 4,
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

@Model({kind: 'model::PropertyOptions'})
export class PropertyOptions extends ModelBase {
    private constructor(
        id: number,
        @Property('defaultValue', {codec: str, defaultValue: () => 'the default value'})
        public defaultValue: string,
        @Property('writeOnly', {codec: str, defaultValue: () => 'is write only'})
        public writeOnly:string
    ) {
        super(id, defaultValue, writeOnly);
    }
}

@Model({kind: 'model::StaticCreate'})
export class WithFactory extends ModelBase {
    static create = createModelFactory(WithFactory);

    constructor(
        id: number,
        @Property('name', {codec: str}) public name: string
    ) {
        super(id, name);
    }
}



