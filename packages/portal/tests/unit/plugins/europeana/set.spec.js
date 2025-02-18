import nock from 'nock';
import sinon from 'sinon';

import plugin, { BASE_URL } from '@/plugins/europeana/set';
const store = { state: { apis: { urls: { set: BASE_URL } } } };

const setId = '1234';
const itemId = '/123/abc';
const $config = { europeana: { apis: { set: { key: 'apikey' } } } };
const likesResponse = {
  '@context': 'http://www.europeana.eu/schemas/context/collection.jsonld',
  id: 'http://data.europeana.eu/set/1234',
  type: 'BookmarkFolder',
  title: {
    en: 'LIKES'
  }
};

describe('@/plugins/europeana/set', () => {
  afterEach(() => {
    nock.cleanAll();
    sinon.resetHistory();
  });

  describe('get()', () => {
    const setId = '1';
    const setGetResponse = {
      id: 'http://data.europeana.eu/set/1',
      type: 'Collection',
      items: [
        'http://data.europeana.eu/item/123/abc',
        'http://data.europeana.eu/item/123/def'
      ]
    };

    it('gets the set data', async() => {
      nock(BASE_URL)
        .get(`/${setId}`)
        .query(true)
        .reply(200, setGetResponse);

      const response = await plugin({ $config, store }).get(setId);
      expect(response.items).toEqual(['http://data.europeana.eu/item/123/abc', 'http://data.europeana.eu/item/123/def']);
    });

    it('includes the axios default params', async() => {
      nock(BASE_URL)
        .get(`/${setId}`)
        .query(query => query.wskey === 'apikey')
        .reply(200, setGetResponse);

      await plugin({ $config, store }).get(setId);
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('getLikes()', () => {
    it('get the likes set ID', async() => {
      const searchResponse = {
        items: [
          'http://data.europeana.eu/set/163'
        ]
      };
      nock(BASE_URL)
        .get('/search')
        .query(query => query.query === 'creator:auth-user-sub type:BookmarkFolder')
        .reply(200, searchResponse);

      const response = await plugin({ $config, store }).getLikes('auth-user-sub');
      expect(response).toBe('http://data.europeana.eu/set/163');
    });
  });

  describe('createLikes()', () => {
    it('creates a likes set', async() => {
      nock(BASE_URL)
        .post('/')
        .query(true)
        .reply(200, likesResponse);

      const response = await plugin({ $config, store }).createLikes();
      expect(response.id).toBe('http://data.europeana.eu/set/1234');
    });
  });

  describe('modifyItems()', () => {
    it('adds item to set', async() => {
      nock(BASE_URL)
        .put(`/${setId}${itemId}`)
        .query(true)
        .reply(200, likesResponse);
      const response =  await plugin({ $config, store }).modifyItems('add', setId, itemId);
      expect(response.id).toBe('http://data.europeana.eu/set/1234');
    });
  });

  describe('delete()', () => {
    it('deletes item from set', async() => {
      nock(BASE_URL)
        .delete(`/${setId}`)
        .query(true)
        .reply(204);

      await plugin({ $config, store }).delete(setId);
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('update()', () => {
    it('updates the set', async() => {
      const body = { type: 'Collection', visibility: 'public' };
      nock(BASE_URL)
        .put(`/${setId}`, body)
        .query(true)
        .reply(200);

      await plugin({ $config, store }).update(setId, body);
      expect(nock.isDone()).toBe(true);
    });

    it('includes params if supplied', async() => {
      const body = { type: 'Collection', visibility: 'public' };
      const params = { profile: 'standard' };
      nock(BASE_URL)
        .put(`/${setId}`, body)
        .query(query => query.profile === params.profile)
        .reply(200);

      await plugin({ $config, store }).update(setId, body, params);
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('publish()', () => {
    it('publishes the set', async() => {
      nock(BASE_URL)
        .put(`/${setId}/publish`)
        .query(true)
        .reply(200);

      await plugin({ $config, store }).publish(setId);
      expect(nock.isDone()).toBe(true);
    });
    describe('when request errors', () => {
      it('throws an error', async() => {
        const errorMessage = 'Set already published';
        nock(BASE_URL)
          .put(`/${setId}/publish`)
          .query(true)
          .reply(400, {
            error: errorMessage
          });

        let error;
        try {
          await plugin({ $config, store }).publish(setId);
        } catch (e) {
          error = e;
        }

        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(400);
      });
    });
  });

  describe('unpublish()', () => {
    it('unpublishes the set', async() => {
      nock(BASE_URL)
        .put(`/${setId}/unpublish`)
        .query(true)
        .reply(200);

      await plugin({ $config, store }).unpublish(setId);
      expect(nock.isDone()).toBe(true);
    });
    describe('when request errors', () => {
      it('throws an error', async() => {
        const errorMessage = 'Set not published';
        nock(BASE_URL)
          .put(`/${setId}/unpublish`)
          .query(true)
          .reply(400, {
            error: errorMessage
          });

        let error;
        try {
          await plugin({ $config, store }).unpublish(setId);
        } catch (e) {
          error = e;
        }

        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(400);
      });
    });
  });

  describe('search()', () => {
    it('queries the Set API for sets matching the params', async() => {
      const searchParams = {
        query: 'type:EntityBestItemsSet',
        profile: 'minimal',
        pageSize: 1
      };

      nock(BASE_URL)
        .get('/search')
        // TODO: Expect the params, this isn't matching the request though.
        // .query({ params: { wskey: 'apikey', ...searchParams } })
        .query(true)
        .reply(200, 'response');

      const response = await plugin({ $config, store }).search(searchParams);

      expect(response.data).toEqual('response');
    });

    describe('options', () => {
      describe('withMinimalItemPreviews', () => {
        const recordSearchResponse = {
          items: [
            { id: '/123/abc', prefLabel: { en: ['ABC'] } }
          ]
        };
        const context = {
          $config,
          $apis: { record: { find: sinon.stub().resolves(recordSearchResponse) } },
          store
        };
        const setSearchResponse = {
          items: [
            {
              id: 'http://data.europeana.eu/set/1',
              items: [
                'http://data.europeana.eu/item/123/abc',
                'http://data.europeana.eu/item/123/ghi'
              ]
            },
            {
              id: 'http://data.europeana.eu/set/2',
              items: ['http://data.europeana.eu/item/123/def']
            }
          ]
        };

        beforeEach(() => {
          nock(BASE_URL)
            .get('/search')
            .query(true)
            .reply(200, setSearchResponse);
        });

        describe('when set to `true`', () => {
          const options = { withMinimalItemPreviews: true };

          it('requests the minimal profile for the first item in each set from the Record API', async() => {
            await plugin(context).search({}, options);

            expect(context.$apis.record.find.calledWith(
              [
                'http://data.europeana.eu/item/123/abc',
                'http://data.europeana.eu/item/123/def'
              ],
              { profile: 'minimal', rows: 100 }
            )).toBe(true);
          });

          it('stores the found items on the sets', async() => {
            const response = await plugin(context).search({}, options);

            expect(response.data.items[0].items[0]).toEqual(recordSearchResponse.items[0]);
          });

          it('stores just the id for first set items not found', async() => {
            const response = await plugin(context).search({}, options);

            expect(response.data.items[1].items[0]).toEqual({
              id: '/123/def'
            });
          });

          it('stores just the id for non-first set items', async() => {
            const response = await plugin(context).search({}, options);

            expect(response.data.items[0].items[1]).toEqual({
              id: '/123/ghi'
            });
          });
        });

        describe('when set to `false` (by default)', () => {
          const options = {};

          it('does not request items from the Record API', async() => {
            await plugin(context).search({}, options);

            expect(context.$apis.record.find.called).toBe(false);
          });

          it('leaves the item URIs on the sets', async() => {
            const response = await plugin(context).search({}, options);

            expect(response.data.items[0].items).toEqual(setSearchResponse.items[0].items);
            expect(response.data.items[1].items).toEqual(setSearchResponse.items[1].items);
          });
        });
      });
    });
  });
});
