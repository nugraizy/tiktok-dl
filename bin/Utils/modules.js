const axios = require('axios');
const Progress = require('progress');
const fs = require('fs');
const chalk = require('chalk');

const insertAtIndex = (arr, index, value) => {
	if (index < 0 || index > arr.length) {
		throw new Error('Index out of bounds');
	}
	return [...arr.slice(0, index), value, ...arr.slice(index)];
};
const formatNumber = (number) => {
	if (typeof number !== 'number') {
		throw new Error('Input must be a number');
	}
	if (number < 1000) {
		return String(number);
	}
	const units = ['K', 'M', 'B', 'T'];
	const unit = Math.floor((number.toFixed(0).length - 1) / 3) * 3;
	const value = (number / 10 ** unit).toFixed(1);
	return `${value}${units[unit / 3 - 1]}`;
};
const _parse = async (type, obj, { clientPost, clientUser }) => {
	if (type === 'user') {
		const { result } = obj;
		const caption = `
${result?.users.nickname} (@${result?.users.username}) ${result?.users.verified ? '✅' : '❎'}
👥 ${formatNumber(result?.stats.followerCount || 0)} · 👤 ${formatNumber(
			result?.stats.followingCount || 0
		)} · 💖 ${formatNumber(result?.stats.heartCount || 0)} · 🎬 ${formatNumber(result?.stats.videoCount || 0)}
${result?.users.signature ? `📄 ${result?.users.signature}\n` : ''}https://tiktok.com/@${result?.users.username}
`;
		return {
			caption,
			fileName: `${result?.users.nickname} - @${result?.users.username}.jpg`,
			username: result?.users.username,
			url: result?.users.avatarLarger
		};
	} else {
		const { result } = obj;
		const { result: res } = await clientUser.search(result?.author.username);
		const caption = `
${result?.author.nickname} (@${result?.author.username}) ${res?.users.verified ? '✅' : '❎'}
👥 ${formatNumber(res?.stats.followerCount || 0)} · 👤 ${formatNumber(res?.stats.followingCount || 0)} · 💖 ${formatNumber(
			res?.stats.heartCount || 0
		)} · 🎬 ${formatNumber(res?.stats.videoCount || 0)}

👀 ${formatNumber(result?.statistics.playCount || 0)} · ❤️ ${formatNumber(
			result?.statistics.likeCount || 0
		)} · 📥 ${formatNumber(result?.statistics.downloadCount || 0)}  · 🔄 ${formatNumber(
			result?.statistics.shareCount || 0
		)} · 💬 ${formatNumber(result?.statistics.commentCount || 0)}
${result?.description ? `📄 ${result?.description}\n` : ''}
https://tiktok.com/@${res?.users.username}

Type ${result?.type === 'image' ? `📷 ${result.images?.length}` : `🎥`}
`;
		return {
			caption,
			fileName: `${result?.createTime} · ${res?.users.nickname} · @${res?.users.username}.${
				result?.type === 'image' ? 'jpg' : 'mp4'
			}`,
			fileNameImage: ` · ${res?.users.nickname} · @${res?.users.username}.jpg`,
			username: res?.users.username,
			avatar: res?.users.avatarLarger,
			url: result?.video?.[0] || result?.images
		};
	}
};
const handleEventProgress = (data, progressBar, stream) =>
	new Promise((resolve) => {
		data.data.on('data', (chunk) => {
			progressBar.tick(chunk.length);
		});

		stream.on('finish', () => {
			resolve();
		});
	});
const downloadFiles = (urls, fileName, dir, folderName) =>
	new Promise(async (resolve, reject) => {
		try {
			if (!fs.existsSync(`${dir}/@${folderName}`)) {
				fs.mkdirSync(`${dir}/@${folderName}`);
			}

			if (Array.isArray(urls)) {
				for (let i = 0, len = urls.length; i < len; i++) {
					const data = await axios({
						method: 'GET',
						url: urls[i],
						responseType: 'stream'
					});
					const stream = data.data.pipe(fs.createWriteStream(`${dir}/@${folderName}/${i + 1} · ${fileName}`));
					const totalLength = data.headers['content-length'];
					const progressBar = new Progress(`Downloading [:bar] :percent :etas "${i + 1} · ${fileName}"`, {
						width: 50,
						complete: chalk.green('='),
						incomplete: ' ',
						renderThrottle: 1,
						total: parseInt(totalLength)
					});

					await handleEventProgress(data, progressBar, stream);
				}

				resolve();
			} else {
				const data = await axios({
					method: 'GET',
					url: urls,
					responseType: 'stream'
				});
				const stream = data.data.pipe(fs.createWriteStream(`${dir}/@${folderName}/${fileName}`));
				const totalLength = data.headers['content-length'];
				const progressBar = new Progress(`Downloading [:bar] :percent :etas "${fileName}"`, {
					width: 50,
					complete: chalk.green('='),
					incomplete: ' ',
					renderThrottle: 1,
					total: parseInt(totalLength),
					callback: () => resolve()
				});
				await handleEventProgress(data, progressBar, stream);
			}
		} catch (error) {
			reject(error);
		}
	});

const delay = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
	_parse,
	downloadFiles,
	delay,
	formatNumber,
	insertAtIndex
};
