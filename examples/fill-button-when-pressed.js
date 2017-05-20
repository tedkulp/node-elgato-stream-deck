'use strict';

const path = require('path');
const streamDeck = require('../index');

streamDeck.on('down', (device, keyIndex) => {
	// Fill the pressed key with an image of the GitHub logo.
	device.fillImageFromFile(keyIndex, path.resolve(__dirname, 'github_logo.png'))
		.catch(error => {
			console.error(error);
		});
});

streamDeck.on('up', (device, keyIndex) => {
	// Clear the key when it is released.
	device.clearKey(keyIndex);
});

streamDeck.on('error', error => {
	console.error(error);
});
