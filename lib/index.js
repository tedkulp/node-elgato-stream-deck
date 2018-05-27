'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Native
var EventEmitter = require('events');
// Packages
var HID = require('node-hid');
var sharp = require('sharp');
var NUM_KEYS = 15;
var PAGE_PACKET_SIZE = 8191;
var NUM_FIRST_PAGE_PIXELS = 2583;
var NUM_SECOND_PAGE_PIXELS = 2601;
var ICON_SIZE = 72;
var NUM_TOTAL_PIXELS = NUM_FIRST_PAGE_PIXELS + NUM_SECOND_PAGE_PIXELS;
var NUM_BUTTON_COLUMNS = 5;
var NUM_BUTTON_ROWS = 3;
var StreamDeck = /** @class */ (function (_super) {
    __extends(StreamDeck, _super);
    function StreamDeck(devicePath) {
        var _this = _super.call(this) || this;
        if (typeof devicePath === 'undefined') {
            // Device path not provided, will then select any connected device.
            var devices = HID.devices();
            var connectedStreamDecks = devices.filter(function (device) {
                return device.vendorId === 0x0fd9 && device.productId === 0x0060;
            });
            if (!connectedStreamDecks.length) {
                throw new Error('No Stream Decks are connected.');
            }
            _this.device = new HID.HID(connectedStreamDecks[0].path);
        }
        else {
            _this.device = new HID.HID(devicePath);
        }
        _this.keyState = new Array(NUM_KEYS).fill(false);
        _this.device.on('data', function (data) {
            // The first byte is a report ID, the last byte appears to be padding.
            // We strip these out for now.
            data = data.slice(1, data.length - 1);
            for (var i = 0; i < NUM_KEYS; i++) {
                var keyPressed = Boolean(data[i]);
                var stateChanged = keyPressed !== _this.keyState[i];
                if (stateChanged) {
                    _this.keyState[i] = keyPressed;
                    if (keyPressed) {
                        _this.emit('down', i);
                    }
                    else {
                        _this.emit('up', i);
                    }
                }
            }
        });
        _this.device.on('error', function (err) {
            _this.emit('error', err);
        });
        return _this;
    }
    Object.defineProperty(StreamDeck, "ICON_SIZE", {
        /**
         * The pixel size of an icon written to the Stream Deck key.
         *
         * @readonly
         */
        get: function () {
            return ICON_SIZE;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Checks a value is a valid RGB value. A number between 0 and 255.
     *
     * @static
     * @param {number} value The number to check
     */
    StreamDeck.checkRGBValue = function (value) {
        if (value < 0 || value > 255) {
            throw new TypeError('Expected a valid color RGB value 0 - 255');
        }
    };
    /**
     * Checks a keyIndex is a valid key for a stream deck. A number between 0 and 14.
     *
     * @static
     * @param {number} keyIndex The keyIndex to check
     */
    StreamDeck.checkValidKeyIndex = function (keyIndex) {
        if (keyIndex < 0 || keyIndex > 14) {
            throw new TypeError('Expected a valid keyIndex 0 - 14');
        }
    };
    /**
     * Pads a given buffer till padLength with 0s.
     *
     * @private
     * @param {Buffer} buffer Buffer to pad
     * @param {number} padLength The length to pad to
     * @returns {Buffer} The Buffer padded to the length requested
     */
    StreamDeck.padBufferToLength = function (buffer, padLength) {
        return Buffer.concat([buffer, StreamDeck.createPadBuffer(padLength - buffer.length)]);
    };
    /**
     * Returns an empty buffer (filled with zeroes) of the given length
     *
     * @private
     * @param {number} padLength Length of the buffer
     * @returns {Buffer}
     */
    StreamDeck.createPadBuffer = function (padLength) {
        return Buffer.alloc(padLength);
    };
    /**
     * Converts a buffer into an number[]. Used to supply the underlying
     * node-hid device with the format it accepts.
     *
     * @static
     * @param {Buffer} buffer Buffer to convert
     * @returns {number[]} the converted buffer
     */
    StreamDeck.bufferToIntArray = function (buffer) {
        var array = [];
        for (var _i = 0, _a = buffer.entries(); _i < _a.length; _i++) {
            var pair = _a[_i];
            array.push(pair[1]);
        }
        return array;
    };
    /**
     * Writes a Buffer to the Stream Deck.
     *
     * @param {Buffer} buffer The buffer written to the Stream Deck
     * @returns undefined
     */
    StreamDeck.prototype.write = function (buffer) {
        return this.device.write(StreamDeck.bufferToIntArray(buffer));
    };
    /**
     * Sends a HID feature report to the Stream Deck.
     *
     * @param {Buffer} buffer The buffer send to the Stream Deck.
     * @returns undefined
     */
    StreamDeck.prototype.sendFeatureReport = function (buffer) {
        return this.device.sendFeatureReport(StreamDeck.bufferToIntArray(buffer));
    };
    /**
     * Fills the given key with a solid color.
     *
     * @param {number} keyIndex The key to fill 0 - 14
     * @param {number} r The color's red value. 0 - 255
     * @param {number} g The color's green value. 0 - 255
     * @param {number} b The color's blue value. 0 -255
     */
    StreamDeck.prototype.fillColor = function (keyIndex, r, g, b) {
        StreamDeck.checkValidKeyIndex(keyIndex);
        StreamDeck.checkRGBValue(r);
        StreamDeck.checkRGBValue(g);
        StreamDeck.checkRGBValue(b);
        var pixel = Buffer.from([b, g, r]);
        this._writePage1(keyIndex, Buffer.alloc(NUM_FIRST_PAGE_PIXELS * 3, pixel));
        this._writePage2(keyIndex, Buffer.alloc(NUM_SECOND_PAGE_PIXELS * 3, pixel));
    };
    /**
     * Fills the given key with an image in a Buffer.
     *
     * @param {number} keyIndex The key to fill 0 - 14
     * @param {Buffer} imageBuffer
     */
    StreamDeck.prototype.fillImage = function (keyIndex, imageBuffer) {
        StreamDeck.checkValidKeyIndex(keyIndex);
        if (imageBuffer.length !== 15552) {
            throw new RangeError("Expected image buffer of length 15552, got length " + imageBuffer.length);
        }
        var pixels = [];
        for (var r = 0; r < ICON_SIZE; r++) {
            var row = [];
            var start = r * 3 * ICON_SIZE;
            for (var i = start; i < start + (ICON_SIZE * 3); i += 3) {
                var r_1 = imageBuffer.readUInt8(i);
                var g = imageBuffer.readUInt8(i + 1);
                var b = imageBuffer.readUInt8(i + 2);
                row.push(r_1, g, b);
            }
            pixels = pixels.concat(row.reverse());
        }
        var firstPagePixels = pixels.slice(0, NUM_FIRST_PAGE_PIXELS * 3);
        var secondPagePixels = pixels.slice(NUM_FIRST_PAGE_PIXELS * 3, NUM_TOTAL_PIXELS * 3);
        this._writePage1(keyIndex, Buffer.from(firstPagePixels));
        this._writePage2(keyIndex, Buffer.from(secondPagePixels));
    };
    /**
     * Fills the given key with an image from a file.
     *
     * @param {number} keyIndex The key to fill 0 - 14
     * @param {String} filePath A file path to an image file
     * @returns {Promise<void>} Resolves when the file has been written
     */
    StreamDeck.prototype.fillImageFromFile = function (keyIndex, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                StreamDeck.checkValidKeyIndex(keyIndex);
                return [2 /*return*/, sharp(filePath)
                        .flatten() // Eliminate alpha channel, if any.
                        .resize(StreamDeck.ICON_SIZE, StreamDeck.ICON_SIZE)
                        .raw()
                        .toBuffer()
                        .then(function (buffer) {
                        return _this.fillImage(keyIndex, buffer);
                    })];
            });
        });
    };
    /**
     * Fills the whole panel with an image in a Buffer.
     * The image is scaled to fit, and then center-cropped (if necessary).
     *
     * @param {Buffer|String} imagePathOrBuffer
     * @param {Object} [sharpOptions] - Options to pass to sharp, necessary if supplying a buffer of raw pixels.
     * See http://sharp.dimens.io/en/latest/api-constructor/#sharpinput-options for more details.
     */
    StreamDeck.prototype.fillPanel = function (imagePathOrBuffer, sharpOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var image, buttons, row, column, buttonFillPromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sharp(imagePathOrBuffer, sharpOptions)
                            .resize(NUM_BUTTON_COLUMNS * ICON_SIZE, NUM_BUTTON_ROWS * ICON_SIZE)
                            .flatten()];
                    case 1:
                        image = _a.sent();
                        buttons = [];
                        for (row = 0; row < NUM_BUTTON_ROWS; row++) {
                            for (column = 0; column < NUM_BUTTON_COLUMNS; column++) {
                                buttons.push({
                                    index: (row * NUM_BUTTON_COLUMNS) + NUM_BUTTON_COLUMNS - column - 1,
                                    x: column,
                                    y: row
                                });
                            }
                        }
                        buttonFillPromises = buttons.map(function (button) { return __awaiter(_this, void 0, void 0, function () {
                            var imageBuffer;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, image.extract({
                                            left: button.x * ICON_SIZE,
                                            top: button.y * ICON_SIZE,
                                            width: ICON_SIZE,
                                            height: ICON_SIZE
                                        }).raw().toBuffer()];
                                    case 1:
                                        imageBuffer = _a.sent();
                                        return [2 /*return*/, this.fillImage(button.index, imageBuffer)];
                                }
                            });
                        }); });
                        return [2 /*return*/, Promise.all(buttonFillPromises)];
                }
            });
        });
    };
    /**
     * Clears the given key.
     *
     * @param {number} keyIndex The key to clear 0 - 14
     * @returns {undefined}
     */
    StreamDeck.prototype.clearKey = function (keyIndex) {
        StreamDeck.checkValidKeyIndex(keyIndex);
        return this.fillColor(keyIndex, 0, 0, 0);
    };
    /**
     * Clears all keys.
     *
     * returns {undefined}
     */
    StreamDeck.prototype.clearAllKeys = function () {
        for (var keyIndex = 0; keyIndex < NUM_KEYS; keyIndex++) {
            this.clearKey(keyIndex);
        }
    };
    /**
     * Sets the brightness of the keys on the Stream Deck
     *
     * @param {number} percentage The percentage brightness
     */
    StreamDeck.prototype.setBrightness = function (percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new RangeError('Expected brightness percentage to be between 0 and 100');
        }
        var brightnessCommandBuffer = Buffer.from([0x05, 0x55, 0xaa, 0xd1, 0x01, percentage]);
        this.sendFeatureReport(StreamDeck.padBufferToLength(brightnessCommandBuffer, 17));
    };
    /**
     * Writes a Stream Deck's page 1 headers and image data to the Stream Deck.
     *
     * @private
     * @param {number} keyIndex The key to write to 0 - 14
     * @param {Buffer} buffer Image data for page 1
     * @returns {undefined}
     */
    StreamDeck.prototype._writePage1 = function (keyIndex, buffer) {
        var header = Buffer.from([
            0x02, 0x01, 0x01, 0x00, 0x00, keyIndex + 1, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x42, 0x4d, 0xf6, 0x3c, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x36, 0x00, 0x00, 0x00, 0x28, 0x00,
            0x00, 0x00, 0x48, 0x00, 0x00, 0x00, 0x48, 0x00,
            0x00, 0x00, 0x01, 0x00, 0x18, 0x00, 0x00, 0x00,
            0x00, 0x00, 0xc0, 0x3c, 0x00, 0x00, 0xc4, 0x0e,
            0x00, 0x00, 0xc4, 0x0e, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);
        var packet = StreamDeck.padBufferToLength(Buffer.concat([header, buffer]), PAGE_PACKET_SIZE);
        return this.write(packet);
    };
    /**
     * Writes a Stream Deck's page 2 headers and image data to the Stream Deck.
     *
     * @private
     * @param {number} keyIndex The key to write to 0 - 14
     * @param {Buffer} buffer Image data for page 2
     * @returns {undefined}
     */
    StreamDeck.prototype._writePage2 = function (keyIndex, buffer) {
        var header = Buffer.from([
            0x02, 0x01, 0x02, 0x00, 0x01, keyIndex + 1, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);
        var packet = StreamDeck.padBufferToLength(Buffer.concat([header, buffer]), PAGE_PACKET_SIZE);
        return this.write(packet);
    };
    return StreamDeck;
}(EventEmitter));
module.exports = StreamDeck;
//# sourceMappingURL=index.js.map