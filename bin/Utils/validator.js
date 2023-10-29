const { logger } = require('./cli.js');
const { resolvePathOutput } = require('./directory.js');

const VALIDATOR = {
	download: (input) => {
		if (!input) {
			console.log('\t');
			logger.warn('You need to pass the URL');
			return false;
		} else {
			return true;
		}
	},
	username: (input) => {
		if (!input) {
			console.log('\t');
			logger.warn('You need to pass the username');
			return false;
		} else {
			return true;
		}
	},
	path: (input) => {
		if (!input) {
			return true;
		}
		if (input === resolvePathOutput()) {
			return true;
		}
		const path = resolvePathOutput(input);
		if (!path) {
			return false;
		}
		return true;
	}
};

module.exports = {
	VALIDATOR
};
