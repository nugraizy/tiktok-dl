const { TiktokDL } = require('@tobyg74/tiktok-api-dl');
const { Cache } = require('./cache/utils.js');

class DownloadPost {
	#cache;
	download;
	constructor() {
		this.download = this.Download;
		this.#cache = new Cache();
	}
	#setCache(key, value) {
		return this.#cache.set(key, value);
	}
	#getCache(key) {
		return this.#cache.get(key);
	}
	Download = (url) =>
		new Promise(async (resolve, reject) => {
			try {
				const data =
					this.#getCache(url) ||
					(await TiktokDL(url, {
						version: 'v1'
					}));
				if (data.status === 'error') {
					this.#setCache(url, data);
					resolve(data);
				}
				this.#setCache(url, data);
				resolve(data);
			} catch (error) {
				reject(error);
			}
		});
}

module.exports = {
	DownloadPost
};
