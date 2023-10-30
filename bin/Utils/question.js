const { DownloadPost } = require('./download-post');
const { SearchUser } = require('./search-user');
const { delay, downloadFiles, insertAtIndex } = require('./modules');
const { askOptions, askQuestions, logger } = require('./cli');
const { VALIDATOR } = require('./validator');

const clientUser = new SearchUser();
const clientPost = new DownloadPost();

const DEFAULT_OPTIONS_ACT = ['User', 'Post', 'Exit'];

const ask = async (downloadPath) => {
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
			const response = await askQuestions(
				'user',
				'Type TikTok username :',
				{ clientUser, ask, output: downloadPath },
				VALIDATOR.username
			);
			console.log(response.caption);
			const options = await askOptions(['Yes', 'No', 'Exit'], 'Do you want to download the avatar?');
			if (options === 'Yes') {
				logger.info('Downloading Avatar');
				await downloadFiles(response.url, 'Avatar ' + response.fileName, downloadPath, response.username);
				await delay(1000);
			}
		} else if (options === 'Post') {
			const response = await askQuestions(
				'post',
				'Paste TikTok URL :',
				{ clientPost, clientUser, ask, output: downloadPath },
				VALIDATOR.download
			);
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
		await ask(downloadPath);
	} catch (error) {
		console.log(error);
		process.exit(0);
	}
};

module.exports = { ask };
