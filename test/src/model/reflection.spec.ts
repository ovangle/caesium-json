
import {ModelBase} from "../../../src/model/base";
import {str, bool} from "../../../src/json_codecs/basic";
import {Model, Property, RefProperty, BackRefProperty} from "../../../src/model/decorators";
import {modelResolver} from "../../../src/model/reflection";
import {BackRefPropertyMetadata} from "../../../src/model/metadata";

@Model({kind: 'test::MyModel', isAbstract: true})
abstract class MyModel extends ModelBase {
    @Property({codec: str, readOnly: true})
    name: string;
}

@Model({kind: 'test::MySubmodel', superType: MyModel})
abstract class MySubmodel extends MyModel {
    @Property({codec: bool})
    killTheInnocents: boolean;
}

@Model({kind: 'test::MyRefModel'})
abstract class MyRefModel extends ModelBase {
    @RefProperty({refName: 'ref'})
    refId: string;

    ref: MyModel;
}

@Model({kind: 'test::MyBackRefModel'})
abstract class MyBackRefModel extends ModelBase {
    @BackRefProperty({to: MyRefModel, refProp: 'refId'})
    backRef: MyRefModel;
}

abstract class ModelWithNoMetadata extends ModelBase {
    @Property({codec: str})
    property: string;
}

abstract class ModelWithConstructor extends ModelBase {
    @Property({codec: str})
    property: string;

    constructor(property: string) {
        super();
        this.property = property;
    }
}

export function reflectionTests() {
    describe('reflection', () => {
        modelResolverTests();
    });
}

function modelResolverTests() {
    describe('modelResolver', () => {
        it('should be possible to obtain the metadata of MyModel', () => {
            var metadata = modelResolver.resolve(MyModel);

            expect(metadata.kind).toBe('test::MyModel');
            expect(metadata.superType).toBe(ModelBase);
            expect(metadata.supertypeMeta).toBeNull();
            expect(metadata.ownProperties.keySeq().toArray())
                .toEqual(['name']);
            expect(metadata.properties.keySeq().toArray())
                .toEqual(['id', 'name']);
        });

        it('should be possible to obtain the metadata of MySubmodel', () => {
            var metadata = modelResolver.resolve(MySubmodel);
            expect(metadata.kind).toBe('test::MySubmodel');
            expect(metadata.superType).toBe(MyModel);
            expect(metadata.ownProperties.keySeq().toArray())
                .toEqual(['killTheInnocents']);
            expect(metadata.properties.keySeq().toArray())
                .toEqual(['id', 'name', 'killTheInnocents']);
        });

        it('should be possible to obtain the metadata of MyRefModel', () => {
            var metadata = modelResolver.resolve(MyRefModel);

            expect(metadata.ownProperties.keySeq().toArray())
                .toEqual(['refId']);
            expect(metadata.properties.keySeq().toArray())
                .toEqual(['id', 'refId']);
        });

        it('should be possible to obtain the metadata of MyBackRefModel', () => {
            var metadata = modelResolver.resolve(MyBackRefModel);
            expect(metadata.ownProperties.keySeq().toArray())
                .toEqual(['backRef']);
            expect(metadata.properties.keySeq().toArray())
                .toEqual(['id', 'backRef']);

            var backRefProp = metadata.properties.get('backRef') as BackRefPropertyMetadata;
            expect(backRefProp.toMetadata).toBe(
                modelResolver.resolve(MyRefModel),
                'should resolve toMetadata with same instance'
            );
            expect(backRefProp.refPropMetadata).toBe(
                modelResolver.resolve(MyRefModel).properties.get('refId'),
                'should resolve refProp with same property instance'
            );
        });

        it('should not be possible to resolve a model with no @Model annotation', () => {
            expect(() => modelResolver.resolve(ModelWithNoMetadata)).toThrow();
        });

        it('should not be possible to resolve a model with a >0 argument constructor', () =>{
            expect(() => modelResolver.resolve(ModelWithConstructor)).toThrow();
        });
    })

}
