const { TiktokStalk } = require('@tobyg74/tiktok-api-dl');
const { Cache } = require('./cache/utils.js');

class SearchUser {
	#cache;
	search;
	constructor() {
		this.search = this.Search;
		this.#cache = new Cache();
	}
	#setCache(key, value) {
		return this.#cache.set(key, value);
	}
	#getCache(key) {
		return this.#cache.get(key);
	}
	Search = (username) =>
		new Promise(async (resolve, reject) => {
			try {
				const data = this.#getCache(username) || (await TiktokStalk(username));
				if (data.status === 'error') {
					this.#setCache(username, data);
					resolve(data);
				}
				this.#setCache(username, data);
				resolve(data);
			} catch (error) {
				reject(error);
			}
		});
}

module.exports = {
	SearchUser
};
