export {Model,Property,RefProperty} from './model/decorators';
export {ModelBase} from './model/base';

/**
 *
 * This is what we'd like the api to look like
 *
 * It doesn't look like this yet, currently we need to
 * actually define the manager seperately.
 *
 * With only a small amount of work it could easily look like this.
 *
@Model({
    kind: 'test::MyModel',
    methods: ['get', 'put', 'post', 'delete' ],
    searches: [
        {
            endpoint: 'upcoming',
            parameters: {
                artist: {
                    converter: (model) => model.id,
                    matcher: modelCompare
                },
                venue: {
                    converter: (model) => model.id,
                    matcher: modelCompare
                }
            }
        }
    ]
})
abstract class Event extends ModelBase {
    @Property({codec: any})
    artist: Artist;

    @Property({codec: any})
    venue: Venue;
}

 var search = event.manager.upcoming;

 search.responseChange.subscribe((response) => {
    response.loadNextPage().then((_) => {
        // display results.
        if (response.seenLastPage) {
            response.dispose();
        }
    });
 });

 search.setParamValue('artist', artist);
 search.setParamValue('venue', venue);
 */
