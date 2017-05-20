'use strict';

// Native
const fs = require('fs');
const path = require('path');

// Packages
const mockery = require('mockery');
const sinon = require('sinon');
const test = require('ava');

// Mocked packages
const mockUSBDetection = require('./fixtures/mock-modules/usb-detection');
const mockNodeHID = require('./fixtures/mock-modules/node-hid');

mockery.registerMock('usb-detection', mockUSBDetection);
mockery.registerMock('node-hid', mockNodeHID);
mockery.enable({
	warnOnUnregistered: false
});

// Must be required after we register a mock for `node-hid`.
const streamDeckOrchestrator = require('../');

test.cb.beforeEach(t => {
	streamDeckOrchestrator.once('connect', device => {
		t.context.streamDeckDevice = device;
		t.end();
	});

	mockUSBDetection.emit(`add:${streamDeckOrchestrator.VENDOR_ID}:${streamDeckOrchestrator.PRODUCT_ID}`);
});

test.afterEach(t => {
	t.context.streamDeckDevice = null;
});

test('fillColor', t => {
	t.plan(2);
	t.context.streamDeckDevice.fillColor(0, 255, 0, 0);

	validateWriteCall(
		t,
		t.context.streamDeckDevice.device.write,
		[
			'fillColor-red-page1.json',
			'fillColor-red-page2.json'
		]
	);
});

test('clearKey', t => {
	t.plan(2);

	t.context.streamDeckDevice.clearKey(0);

	validateWriteCall(
		t,
		t.context.streamDeckDevice.device.write,
		[
			'fillColor-red-page1.json',
			'fillColor-red-page2.json'
		],
		data => {
			return data.map(value => (value === 255) ? 0 : value);
		}
	);
});

test.cb('fillImageFromFile', t => {
	t.plan(2);
	t.context.streamDeckDevice.fillImageFromFile(0, path.resolve(__dirname, 'fixtures/red_square.png'))
	.then(() => {
		validateWriteCall(
			t,
			t.context.streamDeckDevice.device.write,
			[
				'fillImageFromFile-red_square-page1.json',
				'fillImageFromFile-red_square-page2.json'
			]
		);
		t.end();
	}).catch(t.fail);
});

function validateWriteCall(t, spy, files, filter) {
	const callCount = spy.callCount;
	for (let i = 0; i < callCount; i++) {
		let data = readFixtureJSON(files[i]);
		if (filter) {
			data = filter(data);
		}
		t.deepEqual(spy.getCall(i).args[0], data);
	}
}

test('down and up events', t => {
	t.plan(2);
	const downSpy = sinon.spy();
	const upSpy = sinon.spy();
	streamDeckOrchestrator.on('down', downSpy);
	streamDeckOrchestrator.on('up', upSpy);
	t.context.streamDeckDevice.device.emit('data', Buffer.from([0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
	t.context.streamDeckDevice.device.emit('data', Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));

	t.deepEqual(downSpy.getCall(0).args, [t.context.streamDeckDevice, 0]);
	t.deepEqual(upSpy.getCall(0).args, [t.context.streamDeckDevice, 0]);
});

test.cb('forwards error events from the device', t => {
	streamDeckOrchestrator.on('error', () => {
		t.pass();
		t.end();
	});
	t.context.streamDeckDevice.device.emit('error', new Error('Test'));
});

test('fillImage undersized buffer', t => {
	const largeBuffer = Buffer.alloc(1);
	t.throws(() => t.context.streamDeckDevice.fillImage(0, largeBuffer));
});

function readFixtureJSON(fileName) {
	const filePath = path.resolve(__dirname, 'fixtures', fileName);
	const fileData = fs.readFileSync(filePath);
	return JSON.parse(fileData);
}
