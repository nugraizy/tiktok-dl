const inquirer = require('inquirer');
const winston = require('winston');
const { resolvePathOutput } = require('./directory.js');
const { _parse } = require('./modules.js');

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.simple(),
		winston.format.padLevels(),
		winston.format.timestamp(),
		winston.format.printf(({ level, message, timestamp }) => {
			return `${timestamp}  ${level}: ${message?.trim()}`;
		})
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: './bin/Logs/error.log',
			level: 'error'
		}),
		new winston.transports.File({
			filename: './bin/Logs/info.log',
			level: 'info'
		})
	]
});
const askQuestions = async (type, question, { clientPost, clientUser, main }, validator) => {
	if (type === 'user') {
		const { answer } = await inquirer.prompt([
			{
				name: 'answer',
				message: question,
				type: 'input',
				...(validator ? { validate: validator } : {})
			}
		]);
		logger.info('Searching ' + answer);
		const data = await clientUser?.search(answer);
		if (!data) {
			logger.error(answer + ' Not found.');
			await main?.();
		}

		const caption = await _parse('user', data, { clientUser });
		return caption;
	} else if (type === 'post') {
		const { answer } = await inquirer.prompt([
			{
				name: 'answer',
				message: question,
				type: 'input',
				...(validator ? { validate: validator } : {})
			}
		]);
		logger.info('Scraping ' + answer);
		const data = await clientPost?.download(answer);
		if (!data) {
			logger.error(answer + ' Not found.');
			await main?.();
		}
		const caption = await _parse('post', data, {
			clientUser,
			clientPost
		});
		return caption;
	} else if (type === 'path') {
		const defaultPath = resolvePathOutput();
		let { answer } = await inquirer.prompt([
			{
				name: 'answer',
				message: question,
				type: 'input',
				default: defaultPath,
				...(validator ? { validate: validator } : {})
			}
		]);
		if (answer !== defaultPath) {
			answer = resolvePathOutput(answer);
		}
		return answer;
	}
};
const askOptions = async (choices, message) => {
	const { options } = await inquirer.prompt([
		{
			name: 'options',
			message,
			type: 'list',
			choices
		}
	]);
	if (options === 'Exit') {
		process.exit(0);
	}
	return options;
};

module.exports = {
	logger,
	askQuestions,
	askOptions
};
