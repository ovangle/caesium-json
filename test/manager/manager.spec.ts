import 'rxjs/add/operator/toPromise';
import {List} from 'immutable';

import {Inject, forwardRef, OpaqueToken} from '@angular/core';
import {TestBed, inject, async} from '@angular/core/testing';
import {RequestMethod, HttpModule} from '@angular/http';

import {Type} from 'caesium-core/lang';

import {JsonObject, num, itemList, model} from '../../src/json_codecs/index';
import {Model, ModelBase, Property, RefProperty} from '../../src/model/index';
import {Models} from '../../src/module';

import {RequestFactory, ModelHttpModule} from '../../src/manager/http/index';
import {
    SEARCH_PAGE_SIZE, defaultSearchPageSize,
    SEARCH_PAGE_QUERY_PARAM, defaultSearchPageQueryParam
} from '../../src/manager/search/index';
import {ModelManager, SearchParameter} from '../../src/manager/index';
import {InvalidMetadata} from '../../src/model/exceptions';

import {MockRequestFactory, MockRequest} from './request_factory.mock';

@Model({kind: 'test::MyModel'})
export class MyModel extends ModelBase {
    constructor(
        @Property('id', {key: true, codec: num})
        public id: number
    ) {
        super(id);
    }
}


@Model({kind: 'test::AbstractModel', isAbstract: true})
export class AbstractModel extends ModelBase {}

export const ABSTRACT_MODEL_MANAGER = new OpaqueToken('AbstractModelManager');

@Model({kind: 'test::AbstractModelImpl1', superType: AbstractModel})
export class AbstractModelImpl1 extends AbstractModel {}

@Model({kind: 'test::AbstractModelImpl2', superType: AbstractModel})
export class AbstractModelImpl2 extends AbstractModel {}


@Model({kind: 'test::ReferencingModel'})
class ReferencingModel extends ModelBase {
    constructor(
        @RefProperty('refId', {refName: 'ref', refType: MyModel})
        public refId: number
    ) {
        super(refId);
    }

    get ref(): MyModel { return this.get('ref'); }
}

describe('manager.manager', () => {
    describe('ManagerBase', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    HttpModule,
                    Models.provideMetadata([
                        MyModel,
                        {type: AbstractModel, subtypes: [AbstractModelImpl1, AbstractModelImpl2]},
                    ])
                ],
                providers: [
                    {provide: RequestFactory, useClass: MockRequestFactory},

                    {provide: SEARCH_PAGE_SIZE, useValue: defaultSearchPageSize},
                    {provide: SEARCH_PAGE_QUERY_PARAM, useValue: defaultSearchPageQueryParam},
                    ModelManager
                ]
            });
        });

        it('should return a bare model codec for a non abstract type', inject([ModelManager], (manager: ModelManager) => {
            expect(manager.searchPageQueryParam).toBe(defaultSearchPageQueryParam);
            let codec = manager.getModelCodec(MyModel);

            let instance = new MyModel(null);

            // Should use the ModelCodec for the model.
            expect(codec.encode(instance))
                .toEqual({kind: 'test::MyModel', id: null});

            expect(codec.decode({'kind': 'test::MyModel', id: null}))
                .toEqual(jasmine.any(MyModel));
        }));

        it('should return a union codec for an abstract type', inject([ModelManager],
            (manager: ModelManager) => {
                var codec = manager.getModelCodec(AbstractModel);

                let model1 = new AbstractModelImpl1();
                let model2 = new AbstractModelImpl2();

                expect(codec.encode(model1))
                    .toEqual(
                        {kind: 'test::AbstractModelImpl1'},
                        'should encode as AbstractModelImpl1'
                    );
                expect(codec.encode(model2))
                    .toEqual(
                        {kind: 'test::AbstractModelImpl2'},
                        'should encode as AbstractModelImpl2'
                    );

                expect(codec.decode({'kind': 'test::AbstractModelImpl1'}))
                    .toEqual(jasmine.any(AbstractModelImpl1),
                        'should decode as AbstractModelImpl1');
                expect(codec.decode({'kind': 'test::AbstractModelImpl2'}))
                    .toEqual(jasmine.any(AbstractModelImpl2),
                        'should decode as AbstractModelImpl2')
            })
        );


        it('should be possible to get a model by id', async(inject(
            [RequestFactory, ModelManager],
            (requestFactory: MockRequestFactory, manager: ModelManager) => {
                requestFactory.sent$.subscribe((request: MockRequest)=> {
                    expect(request.method).toBe(RequestMethod.Get);
                    expect(request.path).toEqual(['test', '12345']);
                    expect(request.query).toEqual({});

                    request.respond({status: 200, body: new MyModel(12345)});
                });

                manager.load(MyModel, 12345).forEach(model => {
                    expect(model).toEqual(new MyModel(12345));
                })
            }))
        );

        it('should be possible to gte a list of models by their IDs', async(inject(
            [RequestFactory, ModelManager],
            (requestFactory: MockRequestFactory, manager: ModelManager) => {
                let responseItems = List([
                    new MyModel(1),
                    new MyModel(12),
                    new MyModel(123),
                    new MyModel(1234)
                ]);

                requestFactory.sent$.subscribe((request: MockRequest) => {
                    expect(request.method).toBe(RequestMethod.Get);
                    expect(request.path).toEqual(['test']);
                    expect(request.query).toEqual({'ids': '1,12,123,1234'});

                    request.respond({
                        status: 200,
                        body: itemList(model(MyModel)).encode(responseItems)
                    })

                });

                manager.loadMany(MyModel, List([1, 12, 123, 1234])).forEach(models => {
                    expect(models).toEqual(responseItems);
                })
            }))
        );

        it('saving a model with null ID should POST to server', async(inject(
            [RequestFactory, ModelManager],
            (requestFactory: MockRequestFactory, manager: ModelManager) => {
                requestFactory.sent$.subscribe((request) => {

                    expect(request.method).toEqual(RequestMethod.Post);
                    expect(request.path).toEqual(['test']);
                    expect(request.body).toEqual({kind: 'test::MyModel', id: null});

                    let created = new MyModel(42);
                    request.respond({status: 200, body: created});
                });

                let model = new MyModel(null);

                manager.save(model).forEach((saved) => {
                    expect(saved.id).toEqual(42)
                });

            }))
        );


        it('saving a model with not-null ID should PUT to server', async(inject(
            [RequestFactory, ModelManager],
            (requestFactory: MockRequestFactory, manager: ModelManager) => {
                requestFactory.sent$.subscribe((request) => {
                    expect(request.method).toEqual(RequestMethod.Put);
                    expect(request.path).toEqual(['test', '48']);
                    expect(request.body).toEqual({kind: 'test::MyModel', id: 48});

                    request.respond({status: 200, body: new MyModel(48)});
                });

                let model = new MyModel(48);

                manager.save(model).forEach((saved) => {
                    expect(saved.id).toEqual(48)
                });

            })
        ));

        it('should be possible to resolve the value of a reference property', async(inject(
            [RequestFactory, ModelManager],
            (requestFactory: MockRequestFactory, manager: ModelManager) => {
                let model = new ReferencingModel(12345);
                expect(model.isResolved('ref')).toBe(false);

                let reference = new MyModel(12345);

                requestFactory.sent$.subscribe((request) => {
                    expect(request.path).toEqual(['test', '12345']);

                    request.respond({status: 200, body: reference});
                });

                manager.resolve(model, 'ref').forEach(resolved => {
                    expect(resolved).toEqual(jasmine.any(ReferencingModel));
                    expect(resolved.isResolved('ref')).toEqual(true);
                    expect(resolved.ref).toEqual(reference);
                });
            }))
        );

    });
})

