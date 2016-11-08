import 'rxjs/add/operator/toPromise';
import {List} from 'immutable';

import {Type} from 'caesium-core/lang';

import {itemList} from '../../src/json_codecs';
import {Model, ModelBase, RefProperty} from '../../src/model';
import {ManagerOptions, ManagerBase, SearchParameter} from '../../src/manager';
import {RequestMethod} from '../../src/manager/request/interfaces';
import {RawResponse, RequestOptions} from "../../src/manager/model_http";
import {FactoryException} from '../../src/exceptions';

import {MockModelHttp} from './model_http.mock';

function _mkManagerOptions(requestHandler?: (options: RequestOptions) => RawResponse): ManagerOptions {
    function _errHandler(options: RequestOptions): RawResponse {
        throw 'Should not submit a request to the server'
    }
    requestHandler = requestHandler || _errHandler;

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


@Model({kind: 'test::ReferencingModel'})
abstract class ReferencingModel extends ModelBase {
    @RefProperty({refName: 'ref', refType: MyModel})
    refId: number;
    ref: MyModel;
}

export class AbstractModelManager extends ManagerBase<AbstractModel> {
    getModelType(): Type { return AbstractModel; }
    getModelSubtypes(): Type[] { return [AbstractModelImpl1, AbstractModelImpl2]; }
    getSearchParameters(): SearchParameter[] { return undefined; }
}


describe('manager.base', () => {
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
    describe('.modelCodec()', () => {
        it('should return a bare model codec for a non abstract type', () => {
            var manager = new MyModelManager(_mkManagerOptions());
            var codec = manager.modelCodec;

            expect(codec.encode(manager.create(MyModel, {})))
                .toEqual({id: null, 'kind': 'test::MyModel'});

            expect(codec.decode({'kind': 'test::MyModel'}))
                .toEqual(jasmine.any(MyModel));
        });

        it('should return a union codec for an abstract type', () => {
            var manager = new AbstractModelManager(_mkManagerOptions());
            var codec = manager.modelCodec;

            expect(codec.encode(manager.create(AbstractModelImpl1, {})))
                .toEqual(
                    {'kind': 'test::AbstractModelImpl1', id: null},
                    'should encode as AbstractModelImpl1'
                );
            expect(codec.encode(manager.create(AbstractModelImpl2, {})))
                .toEqual(
                    {'kind': 'test::AbstractModelImpl2', id: null},
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
    describe('.getById()', () => {
        it('should be possible to get a model by id', (done) => {
            function requestHandler(options: RequestOptions): RawResponse {
                expect(options.method).toBe(RequestMethod.Get);
                expect(options.endpoint).toBe('12345');

                return {
                    status: 200,
                    body: {kind: 'test::MyModel', id: 12345}
                }
            }

            var manager = new MyModelManager(_mkManagerOptions(requestHandler));

            manager.getById(12345)
                .handle({select: 200, decoder: manager.modelCodec}).toPromise()
                .then((myModel) => {
                    expect(myModel).toEqual(jasmine.any(MyModel));
                    expect(myModel.id).toEqual(12345);
                })
                .catch((err) => fail(err))
                .then((_) => done());
        });
    });


    describe('.getAllByReference()', () => {
        it('should be possible to obtain all models which agree on a foreign key', (done) => {
            function requestHandler(options:RequestOptions) {
                expect(options.method).toBe(RequestMethod.Get);
                expect(options.endpoint).toBe('');
                expect(options.params).toEqual({refId: '12345'});

                return {
                    status: 200,
                    body: {items: [{id: 10011, ref_id: 12345}, {id: 23456, ref_id: 12345}]}
                };
            }

            var manager = new MyModelManager(_mkManagerOptions(requestHandler));

            var myModel = {id: 12345} as any;

            return manager.getAllByReference('refId', myModel)
                .handle({select: 200, decoder: itemList<MyModel>(manager.modelCodec)})
                .toPromise().then((refModels:List<ReferencingModel>) => {
                    expect(refModels.count()).toBe(2);
                    expect(refModels.get(0).id).toEqual(10011, 'should have a refModel with `id=10011`');
                    expect(refModels.get(1).id).toEqual(23456, 'should have a refModel with `id=23456`');
                })
                .catch((err) => fail(err))
                .then((_) => done());
        });
    });
});

