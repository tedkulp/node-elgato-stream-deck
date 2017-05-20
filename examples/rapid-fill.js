'use strict';

const streamDeck = require('../index');

streamDeck.on('connect', device => {
	console.log('Stream Deck connected');
	const interval = setInterval(() => {
		const r = getRandomIntInclusive(0, 255);
		const g = getRandomIntInclusive(0, 255);
		const b = getRandomIntInclusive(0, 255);
		for (let i = 0; i < 15; i++) {
			try {
				device.fillColor(i, r, g, b);
			} catch (e) {
				clearInterval(interval);

				if (e.message === 'Cannot write to HID device') {
					console.error('Stream Deck disconnected');
				} else {
					console.error(e);
				}

				break;
			}
		}
	}, 1000 / 5);
});

streamDeck.on('error', (device, error) => {
	console.error(error);
});

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
