'use strict';

const PRODUCT_ID = 0x0060;
const VENDOR_ID = 0x0fd9;

// Native
const EventEmitter = require('events');
const emitter = new EventEmitter();

// Packages
const HID = require('node-hid');
const usbDetect = require('usb-detection');

// Ours
const StreamDeck = require('./lib/StreamDeck');

const streamDeckMap = new Map();
emitter.connectedStreamDecks = streamDeckMap;

usbDetect.find(VENDOR_ID, PRODUCT_ID, err => {
	if (err) {
		emitter.emit('error', err);
		return;
	}

	refreshStreamDecks();
});

usbDetect.on(`add:${VENDOR_ID}:${PRODUCT_ID}`, () => {
	refreshStreamDecks();
});

process.on('exit', () => {
	usbDetect.stopMonitoring();
});

emitter.getDevice = function (index) {
	return Array.from(streamDeckMap.values())[index];
};

function refreshStreamDecks() {
	const devices = HID.devices();
	const connectedStreamDecks = devices.filter(device => {
		return device.vendorId === 0x0fd9 && device.productId === 0x0060;
	});

	connectedStreamDecks.forEach(device => {
		if (streamDeckMap.has(device.path)) {
			return;
		}

		const streamDeck = new StreamDeck(new HID.HID(device.path));
		streamDeck.on('*', function () {
			if (this.event === 'disconnect') {
				streamDeckMap.delete(device.path);
			}

			emitter.emit(this.event, streamDeck, ...arguments);
		});

		streamDeckMap.set(device.path, streamDeck);

		emitter.emit('connect', streamDeck);
	});
}

module.exports = emitter;
