import {List} from 'immutable';

import {forwardRef} from '@angular/core';

import {Type} from 'caesium-core/lang';

import {createModelFactory, ModelFactory} from '../../src/model/factory';
import {Model, Property, RefProperty} from '../../src/model/decorators';
import {ModelBase} from '../../src/model/base';

import {str, num, bool} from '../../src/json_codecs/index';

@Model({kind: 'model::ModelNoProperties'})
export class ModelNoProperties extends ModelBase {
    static constructorRunCount = 0;

    constructor() {
        super();
        ModelNoProperties.constructorRunCount++;
    }
}

@Model({kind: 'model.path.to.resource::ComplexPath'})
export class ComplexPath extends ModelBase {
    constructor() {
        super();
    }
}


@Model({kind: 'model::ModelSupertype', isAbstract: true})
export class ModelSupertype extends ModelBase {
    constructor() {
        super();
    }
}

@Model({kind: 'model::ModelSubtype', superType: ModelSupertype})
export class ModelSubtype extends ModelSupertype {

    static create = createModelFactory(forwardRef(() => ModelSubtype));

    constructor() {
        super();
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
        @Property('prop', {codec: str}) public prop: string,
        ...args: any[] // Subtype arguments.
    ) {
        super(prop, ...args);
    }
}


@Model({kind:'model::OneSuepertypeProperty', isAbstract: true})
export class OneSupertypeProperty extends ModelBase {
    static create(args: {prop?: ModelNoProperties}): ModelOneProperty {
        return <ModelOneProperty>createModelFactory(ModelOneProperty)(args);
    }

    constructor(
        @Property('prop', {codec: str}) public prop: string,
        ...args: any[] // Subtype arguments.
    ) {
        super(prop, ...args);
    }
}

@Model({kind: 'model::OnePropertySubtype', superType: OneSupertypeProperty})
export class OneSubtypeProperty extends OneSupertypeProperty {
    constructor(
        prop: string,
        @Property('newProp', {codec: str}) public newProp: string,
    ) {
        super(newProp);
    }
}

@Model({kind: 'model::ModelTwoProperties'})
export class ModelTwoProperties extends ModelBase {
    constructor(
        @Property('propOne', {codec: str}) public propOne: string,
        @Property('propTwo', {codec: str}) public propTwo: string
    ) {
        super(propOne, propTwo);
    }
}

@Model({kind: 'model::Managed'})
export class Managed extends ModelBase {
    constructor(
        @Property('id', {key: true, codec: num})
        public id: number
    ) {
        super(id);
    }
}

@Model({kind: 'model::ManagedSupertype', isAbstract: true})
export class ManagedSupertype extends ModelBase {
    constructor(
        @Property('id', {key: true, codec: num})
        public id: number,
        ...args: any[]
    ) {
        super(id, args);
    }
}

@Model({kind: 'model::ManagedSubtype', superType: ManagedSupertype})
export class ManagedSubtype extends ManagedSupertype {
    constructor(
        public id: number
    ) { super(id); }
}

@Model({kind: 'model::ModelOneRefProperty'})
export class ModelOneRefProperty extends ModelBase {
    //FIXME: Should be constructor(@Property(ModelNoProperties) public prop: ModelNoProperties)
    constructor(
        @RefProperty('propId', {refType: Managed, refName: 'prop'})
        public propId: number,
    ) {
        super(propId);
    }
}

// TODO: This is the desired form for References
// @Model({
//      references: [
//         {to: forwardRef(() => ReferenceModel),
//      ]

//          to: SELF_REFERENCE, // A special marker which represents a relation to the same type.
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
        @RefProperty('multiPropId', {refType: Managed, refName: 'multiProp', isMulti: true})
        public multiPropId: List<number>
    ) {
        super(multiPropId);
    }
}

@Model({kind: 'model::ModelMixedProperties'})
export class ModelMixedProperties extends ModelBase {
    constructor(
        @RefProperty('propOne', {refType: Managed, refName: 'propOneRef'})
        public propOne: number = 4,
        @Property('propTwo',{codec: str})
        public propTwo: String,
        @Property('propThree', {codec: str})
        public propThree: String,
        @RefProperty('propFour', {refType: ManagedSubtype, refName: 'propFourRef'})
        public propFour: number
    ) {
        super(propOne, propTwo, propThree, propFour);
    }
}

@Model({kind: 'model::StaticCreate'})
export class WithFactory extends ModelBase {
    static create = createModelFactory(WithFactory);

    constructor(
        @Property('name', {codec: str}) public name: string
    ) {
        super(name);
    }
}

@Model({kind: 'model::PropertyOptions'})
export class PropertyOptions extends ModelBase {
    constructor(
        @Property('noOptions', {codec: bool})
        public noOptions: boolean,
        @Property('valueDefault', {codec: str, default: 'default value'})
        public valueDefault: string,
        @Property('callableDefault', {codec: str, default: () => 'return value'})
        public callableDefault: string
    ) {
        super(noOptions, valueDefault, callableDefault);
    }

}



