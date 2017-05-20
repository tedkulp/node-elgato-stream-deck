'use strict';

// Native
const EventEmitter = require('events');

class MockUSBDetection extends EventEmitter {
	find(vid, pid, cb) {
		process.nextTick(cb);
	}

	stopMonitoring() {

	}
}

module.exports = new MockUSBDetection();
