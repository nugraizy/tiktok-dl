const path = require('path');
const os = require('os');
const { existsSync } = require('fs');

const resolvePathOutput = (outputDir) => {
	const cwd = process.cwd();
	const homedir = os.homedir();
	let outputPath;
	if (outputDir?.startsWith('./') || outputDir?.startsWith('../') || outputDir === '.') {
		outputPath = path.join(cwd, outputDir);
	} else if (outputDir?.startsWith('~/')) {
		outputPath = path.join(homedir, outputDir.slice(2));
	} else if (!outputDir) {
		outputPath = path.resolve(homedir, cwd);
	} else {
		outputPath = path.join(cwd, outputDir);
	}
	outputPath = path.normalize(outputPath);
	if (!existsSync(outputPath)) {
		return null;
	}
	return outputPath;
};

module.exports = {
	resolvePathOutput
};
