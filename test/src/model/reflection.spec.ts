
import {Model} from "../../../src/model/decorators";
import {ModelBase} from "../../../src/model/base";
import {str, bool} from "../../../src/json_codecs/basic";
import {Property} from "../../../src/model/decorators";
import {modelResolver} from "../../../src/model/reflection";

@Model({kind: 'test::MyModel'})
abstract class MyModel extends ModelBase {
    @Property({codec: str, readOnly: true})
    name: string;
}

@Model({kind: 'test::MySubmodel', superType: MyModel})
abstract class MySubmodel extends MyModel {
    @Property({codec: bool})
    killTheInnocents: boolean;
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
                .toEqual(['name']);
        });
        
        it('should be possible to obtain the metadata of MySubmodel', () => {
            var metadata = modelResolver.resolve(MySubmodel);  
            expect(metadata.kind).toBe('test::MySubmodel');
            expect(metadata.superType).toBe(MyModel);
            expect(metadata.ownProperties.keySeq().toArray())
                .toEqual(['killTheInnocents']);
            expect(metadata.properties.keySeq().toArray())
                .toEqual(['name', 'killTheInnocents']);
        });
        
        it('should not be possible to resolve a model with no @Model annotation', () => {
            expect(() => modelResolver.resolve(ModelWithNoMetadata)).toThrow();
        });
        
        it('should not be possible to resolve a model with a >0 argument constructor', () =>{
            expect(() => modelResolver.resolve(ModelWithConstructor)).toThrow();
        });
    })

}
