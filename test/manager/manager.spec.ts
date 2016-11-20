import 'rxjs/add/operator/toPromise';
import {List} from 'immutable';

import {Inject, forwardRef, OpaqueToken} from '@angular/core';
import {TestBed, inject} from '@angular/core/testing';
import {RequestMethod, HttpModule} from '@angular/http';

import {Type} from 'caesium-core/lang';

import {JsonObject, itemList} from '../../src/json_codecs';
import {Model, ModelBase, RefProperty} from '../../src/model';
import {Models} from '../../src/module';

import {RequestFactory, ModelHttpModule} from '../../src/manager/http';
import {
    SEARCH_PAGE_SIZE, defaultSearchPageSize,
    SEARCH_PAGE_QUERY_PARAM, defaultSearchPageQueryParam
} from '../../src/manager/search';
import {ModelManager, SearchParameter} from '../../src/manager';
import {InvalidMetadata} from '../../src/model/exceptions';

import {MockRequestFactory, MockRequest} from './request_factory.mock';

@Model({kind: 'test::MyModel'})
export class MyModel extends ModelBase {
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
        id: number,
        @RefProperty('ref', {refName: 'ref', refType: MyModel})
        refId: number
    ) {
        super(id, refId);
    }
}

describe('manager.base', () => {
    describe('ManagerBase', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpModule,
                    Models.provideMetadata([
                        MyModel,
                        {type: AbstractModel, subtypes: [AbstractModelImpl1, AbstractModelImpl2]}
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

            expect(codec.decode({'kind': 'test::MyModel'}))
                .toEqual(jasmine.any(MyModel));
        }));

        it('should return a union codec for an abstract type', inject([ModelManager],
            (manager: ModelManager) => {
                var codec = manager.getModelCodec(AbstractModel);

                let model1 = new AbstractModelImpl1(null);
                let model2 = new AbstractModelImpl2(null);

                expect(codec.encode(model1))
                    .toEqual(
                        {kind: 'test::AbstractModelImpl1', id: null},
                        'should encode as AbstractModelImpl1'
                    );
                expect(codec.encode(model2))
                    .toEqual(
                        {kind: 'test::AbstractModelImpl2', id: null},
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


        it('should be possible to get a model by id', inject(
            [RequestFactory, ModelManager],
            (requestFactory: MockRequestFactory, manager: ModelManager) => {
                requestFactory.sent$.subscribe((request: MockRequest)=> {
                    expect(request.method).toBe(RequestMethod.Get);
                    expect(request.path).toEqual(['test', '12345']);
                    expect(request.query).toEqual({});

                    request.respond({status: 200, body: new MyModel(12345)});
                });

                manager.getById<MyModel>(MyModel, 12345).forEach(model => {
                    expect(model).toEqual(new MyModel(12345));
                })
            })
        );

        it('saving a model with null ID should POST to server', inject(
            [RequestFactory, ModelManager],
            (requestFactory: MockRequestFactory, manager: ModelManager) => {
                requestFactory.sent$.subscribe((request) => {

                    expect(request.method).toEqual(RequestMethod.Post);
                    expect(request.path).toEqual(['test', 'create']);
                    expect(request.body).toEqual({kind: 'test::MyModel', id: null});

                    let created = new MyModel(42);
                    request.respond({status: 200, body: created});
                });

                let model = new MyModel(null);

                manager.save(model).forEach((saved) => {
                    expect(saved.id).toEqual(42)
                });

            })
        );


        it('saving a model with not-null ID should PUT to server', inject(
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
        );
    });
})

