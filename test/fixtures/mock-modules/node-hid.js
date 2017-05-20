'use strict';

// Native
const EventEmitter = require('events');

// Packages
const sinon = require('sinon');
const uuidV4 = require('uuid/v4');

class MockHID extends EventEmitter {
	constructor() {
		super();
		this.write = sinon.spy();
	}
}

module.exports = {
	devices() {
		return [{
			vendorId: 0x0fd9,
			productId: 0x0060,
			path: uuidV4()
		}];
	},
	HID: MockHID
};
