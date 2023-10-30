#! /usr/bin/env node
const meow = require('meow');
const { ask } = require('./Utils/question');
const { handler } = require('./Utils/handler');
const { postUrlReg } = require('./Utils/modules');

const cli = meow(
	`
	Usage
	  $ tiktok-api [,input]
	Options
	  --username, -u  TikTok username
	  --download, -d  TikTok post URL
	Examples
	  $ tiktok-api
	  $ tiktok-api -u username
	  $ tiktok-api -d https://www.tiktok.com/@username/video/1234567891234567891
	  $ tiktok-api https://www.tiktok.com/@username https://vt.tiktok.com/ZSNxxxx
	  $ tiktok-api -d https://vt.tiktok.com/ZSNxxxx -u username -o output
`,
	{
		flags: {
			output: {
				type: 'string',
				alias: 'o'
			},
			username: {
				type: 'string',
				alias: 'u'
			},
			download: {
				type: 'string',
				alias: 'u'
			}
		}
	}
);

(async () => {
	if (cli.flags.help || cli.flags.h) {
		console.log(cli.help);
		process.exit(0);
	}

	if (cli.flags.version || cli.flags.v) {
		console.log(cli.pkg.version);
		process.exit(0);
	}

	if (Object.keys(cli.flags).length === 0) {
		await ask(cli.flags.output);
	} else {
		if (cli.flags.username) {
			await handler('user', { cli, input: cli.flags.username });
		}

		if (cli.flags.download) {
			await handler('post', { cli, input: cli.flags.download });
		}
		for (const input of cli.input) {
			if (postUrlReg.test(input)) {
				await handler('post', { cli, input });
				continue;
			}
			await handler('user', { cli, input });
		}
	}

	return;
})();
