import { CACHE_KEY as TIMES_CACHE_KEY } from '../../cachers/entities/times.js';
import { CACHE_KEY as TOPICS_CACHE_KEY } from '../../cachers/entities/topics.js';
import { CACHE_KEY as ITEMS_CACHE_KEY } from '../../cachers/items/recent.js';
import { CACHE_KEY as ITEM_COUNTS_BY_MEDIA_TYPE_CACHE_KEY } from '../../cachers/items/type-counts.js';
import { createRedisClient } from '../../cachers/utils.js';
import { errorHandler } from './index.js';

const subsetSize = 4;

const offsetOfTheDay = (setSize, options = {}) => {
  const millisecondsPerDay = (1000 * 60 * 60 * 24);
  const unixDay = Math.floor(Date.now() / millisecondsPerDay);
  const offset = (unixDay * options.size || subsetSize) % setSize;
  return (offset + options.size || subsetSize <= setSize) ? offset : (setSize - options.size || subsetSize);
};

export const entriesOfTheDay = (type, config = {}, options = {}) => {
  const redisClient = createRedisClient(config.redis);

  let key;
  if (type === 'time') {
    key = TIMES_CACHE_KEY;
  } else if (type === 'topic') {
    key = TOPICS_CACHE_KEY;
  } else if (type === 'item') {
    key = ITEMS_CACHE_KEY;
  } else if (type === 'itemCountsMediaType') {
    key = ITEM_COUNTS_BY_MEDIA_TYPE_CACHE_KEY;
  }

  return redisClient.getAsync(key)
    .then(value => JSON.parse(value))
    .then(parsed => {
      redisClient.quitAsync();
      const offset = offsetOfTheDay(parsed.length, options);
      return parsed.slice(offset, offset + options.size || subsetSize);
    });
};

export default (type, config = {}, options = {}) => (req, res) => {
  if (!config.redis.url) {
    return errorHandler(res, new Error('No cache configured.'));
  }

  return entriesOfTheDay(type, config, options)
    .then(times => res.json(times))
    .catch(error => errorHandler(res, error));
};
