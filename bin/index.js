#! /usr/bin/env node
const { DownloadPost } = require('./Utils/download-post.js');
const { SearchUser } = require('./Utils/search-user.js');
const { delay, downloadFiles, insertAtIndex } = require('./Utils/modules.js');
const { askOptions, askQuestions, logger } = require('./Utils/cli.js');
const { VALIDATOR } = require('./Utils/validator.js');

const clientUser = new SearchUser();
const clientPost = new DownloadPost();

let downloadPath;
const DEFAULT_OPTIONS_ACT = ['User', 'Post', 'Exit'];

const main = async () => {
	try {
		const options = await askOptions(
			downloadPath ? insertAtIndex(DEFAULT_OPTIONS_ACT, 2, 'Path') : DEFAULT_OPTIONS_ACT,
			'Choose options'
		);
		if (options === 'Path') {
			downloadPath = null;
		}
		if (!downloadPath) {
			downloadPath = await askQuestions('path', 'Where would you like the output file to be saved?', {}, VALIDATOR.path);
		}
		if (options === 'User') {
			const response = await askQuestions('user', 'Type TikTok username :', { clientUser, main }, VALIDATOR.username);
			console.log(response.caption);
			const options = await askOptions(['Yes', 'No', 'Exit'], 'Do you want to download the avatar?');
			if (options === 'Yes') {
				logger.info('Downloading Avatar');
				await downloadFiles(response.url, 'Avatar ' + response.fileName, downloadPath, response.username);
				await delay(1000);
			}
		} else if (options === 'Post') {
			const response = await askQuestions('post', 'Paste TikTok URL :', { clientPost, clientUser, main }, VALIDATOR.download);
			console.log(response.caption);
			const options = await askOptions(['Yes', 'No', 'Exit'], 'Do you want to download the avatar?');

			if (options === 'Yes') {
				logger.info('Downloading Avatar');
				await downloadFiles(response.avatar, 'Avatar' + response.fileNameImage, downloadPath, response.username);
				await delay(1000);
			}
			logger.info('Downloading Media');
			await downloadFiles(response.url, response.fileName, downloadPath, response.username);
			await delay(2000);
		}
		await main();
	} catch (error) {
		console.log(error);
		process.exit(0);
	}
};

(async () => {
	await main();
})();
