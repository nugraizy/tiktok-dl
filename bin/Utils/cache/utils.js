const NodeCache = require('node-cache');
const cache = new NodeCache({
	stdTTL: 60 * 60 * 1000,
	deleteOnExpire: true
});
class Cache {
	set;
	get;
	flush;
	constructor() {
		this.set = setCache;
		this.get = getCache;
		this.flush = flushCache;
	}
}
const setCache = (key, value) => cache.set(key, value);
const getCache = (key) => cache.get(key);
const flushCache = () => cache.flushAll();

module.exports = {
	Cache
};
