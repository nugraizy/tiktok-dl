const { DownloadPost } = require('./download-post');
const { SearchUser } = require('./search-user');
const { logger } = require('./cli');
const { _parse, downloadFiles, userUrlReg } = require('./modules');
const { resolvePathOutput } = require('./directory');

const clientUser = new SearchUser();
const clientPost = new DownloadPost();

const handler = (type, { cli, input }) =>
	new Promise(async (resolve) => {
		const downloadPath = resolvePathOutput(cli.flags.output);

		if (type === 'user') {
			let user = input;
			if (userUrlReg.test(input)) {
				user = input.trim().match(userUrlReg)[0].replace('@', '');
			}
			logger.info('Searching ' + user);
			const result = await clientUser.search(user);
			if (!result) {
				logger.error(user + ' Not found.');
				process.exit(0);
			}

			const response = await _parse('user', result);

			console.log(response.caption);

			logger.info('Downloading Profile Picture');

			await downloadFiles(response.url, 'Avatar ' + response.fileName, downloadPath, response.username);
		}

		if (type === 'post') {
			logger.info('Downloading ' + input);
			const result = await clientPost.download(input);
			if (!result) {
				logger.error(input + ' Not found.');
				process.exit(0);
			}

			const response = await _parse('post', result, { clientUser });

			console.log(response.caption);

			logger.info('Downloading Profile Picture');

			await downloadFiles(response.url, 'Post ' + response.fileName, downloadPath, response.username);
		}

		resolve();
	});

module.exports = { handler };
