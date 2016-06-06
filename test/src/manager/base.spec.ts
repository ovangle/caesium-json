import {Type} from 'caesium-core/lang';
import {Model, ModelBase} from '../../../src/model';
import {ManagerOptions, ManagerBase, SearchParameter} from '../../../src/manager';
import {RawResponse, RequestOptions} from "../../../src/manager/model_http";
import {FactoryException} from '../../../src/exceptions';

import {MockModelHttp} from './model_http.mock';

function _mkManagerOptions() {
    //Should not be submitting requests for these tests
    function requestHandler(options: RequestOptions): RawResponse {
        throw 'Should not submit a request';
    }

    return new ManagerOptions(new MockModelHttp(requestHandler))
}

@Model({kind: 'test::MyModel'})
export abstract class MyModel extends ModelBase {}

export class MyModelManager extends ManagerBase<MyModel> {
    constructor(options: ManagerOptions) {
        super(options);
    }

    getModelType() { return MyModel; }
    getModelSubtypes(): Type[] { return []; }
    getSearchParameters(): SearchParameter[] { return undefined; }
}

@Model({kind: 'test::AbstractModel', isAbstract: true})
export abstract class AbstractModel extends ModelBase {}

@Model({kind: 'test::AbstractModelImpl1', superType: AbstractModel})
export abstract class AbstractModelImpl1 extends AbstractModel {}

@Model({kind: 'test::AbstractModelImpl2', superType: AbstractModel})
export abstract class AbstractModelImpl2 extends AbstractModel {}

export class AbstractModelManager extends ManagerBase<AbstractModel> {
    getModelType(): Type { return AbstractModel; }
    getModelSubtypes(): Type[] { return [AbstractModelImpl1, AbstractModelImpl2]; }
    getSearchParameters(): SearchParameter[] { return undefined; }
}

export function managerBaseTests() {
    describe('ManagerBase', () => {
        createTests();
        modelCodecTests();
    });
}

function createTests() {
    describe('.create()', () => {
        it('should create the model', () => {
            var manager = new MyModelManager(_mkManagerOptions());
            var instance = manager.create(MyModel, {});
            expect(instance).toEqual(jasmine.any(MyModel));
        });

        it('should create the appropriate subtype of an abstract type', () => {
            var manager = new AbstractModelManager(_mkManagerOptions());
            var instance1 = manager.create(AbstractModelImpl1, {});
            expect(instance1).toEqual(
                jasmine.any(AbstractModelImpl1),
                'should create an instance of AbstractModelImp1'
            );

            var instance2 = manager.create(AbstractModelImpl2, {});
            expect(instance2).toEqual(
                jasmine.any(AbstractModelImpl2),
                'should create an instance of AbstractModelImpl2'
            );
        });

        it('should throw if the type is not a registered subtype', () => {
            var manager = new AbstractModelManager(_mkManagerOptions());
            expect(() => manager.create(MyModel, {}))
                .toThrow(jasmine.any(FactoryException));
        });
    });
}

function modelCodecTests() {
    describe('.modelCodec()', () => {
        it('should return a bare model codec for a non abstract type', () => {
            var manager = new MyModelManager(_mkManagerOptions());
            var codec = manager.modelCodec;

            expect(codec.encode(manager.create(MyModel, {})))
                .toEqual({'kind': 'test::MyModel'});

            expect(codec.decode({'kind': 'test::MyModel'}))
                .toEqual(jasmine.any(MyModel));
        });

        it('should return a union codec for an abstract type', () => {
            var manager = new AbstractModelManager(_mkManagerOptions());
            var codec = manager.modelCodec;

            expect(codec.encode(manager.create(AbstractModelImpl1, {})))
                .toEqual(
                    {'kind': 'test::AbstractModelImpl1'},
                    'should encode as AbstractModelImpl1'
                );
            expect(codec.encode(manager.create(AbstractModelImpl2, {})))
                .toEqual(
                    {'kind': 'test::AbstractModelImpl2'},
                    'should encode as AbstractModelImpl2'
                );

            expect(codec.decode({'kind': 'test::AbstractModelImpl1'}))
                .toEqual(jasmine.any(AbstractModelImpl1),
                     'should decode as AbstractModelImpl1');
            expect(codec.decode({'kind': 'test::AbstractModelImpl2'}))
                .toEqual(jasmine.any(AbstractModelImpl2),
                    'should decode as AbstractModelImpl2')

        });
    });
}
