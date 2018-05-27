/// <reference types="node" />
declare const EventEmitter: any;
declare const HID: any;
declare const sharp: any;
declare const NUM_KEYS = 15;
declare const PAGE_PACKET_SIZE = 8191;
declare const NUM_FIRST_PAGE_PIXELS = 2583;
declare const NUM_SECOND_PAGE_PIXELS = 2601;
declare const ICON_SIZE = 72;
declare const NUM_TOTAL_PIXELS: number;
declare const NUM_BUTTON_COLUMNS = 5;
declare const NUM_BUTTON_ROWS = 3;
declare class StreamDeck extends EventEmitter {
    /**
     * The pixel size of an icon written to the Stream Deck key.
     *
     * @readonly
     */
    static readonly ICON_SIZE: number;
    /**
     * Checks a value is a valid RGB value. A number between 0 and 255.
     *
     * @static
     * @param {number} value The number to check
     */
    static checkRGBValue(value: any): void;
    /**
     * Checks a keyIndex is a valid key for a stream deck. A number between 0 and 14.
     *
     * @static
     * @param {number} keyIndex The keyIndex to check
     */
    static checkValidKeyIndex(keyIndex: any): void;
    /**
     * Pads a given buffer till padLength with 0s.
     *
     * @private
     * @param {Buffer} buffer Buffer to pad
     * @param {number} padLength The length to pad to
     * @returns {Buffer} The Buffer padded to the length requested
     */
    static padBufferToLength(buffer: any, padLength: any): Buffer;
    /**
     * Returns an empty buffer (filled with zeroes) of the given length
     *
     * @private
     * @param {number} padLength Length of the buffer
     * @returns {Buffer}
     */
    static createPadBuffer(padLength: any): Buffer;
    /**
     * Converts a buffer into an number[]. Used to supply the underlying
     * node-hid device with the format it accepts.
     *
     * @static
     * @param {Buffer} buffer Buffer to convert
     * @returns {number[]} the converted buffer
     */
    static bufferToIntArray(buffer: any): any[];
    constructor(devicePath: any);
    /**
     * Writes a Buffer to the Stream Deck.
     *
     * @param {Buffer} buffer The buffer written to the Stream Deck
     * @returns undefined
     */
    write(buffer: any): any;
    /**
     * Sends a HID feature report to the Stream Deck.
     *
     * @param {Buffer} buffer The buffer send to the Stream Deck.
     * @returns undefined
     */
    sendFeatureReport(buffer: any): any;
    /**
     * Fills the given key with a solid color.
     *
     * @param {number} keyIndex The key to fill 0 - 14
     * @param {number} r The color's red value. 0 - 255
     * @param {number} g The color's green value. 0 - 255
     * @param {number} b The color's blue value. 0 -255
     */
    fillColor(keyIndex: any, r: any, g: any, b: any): void;
    /**
     * Fills the given key with an image in a Buffer.
     *
     * @param {number} keyIndex The key to fill 0 - 14
     * @param {Buffer} imageBuffer
     */
    fillImage(keyIndex: any, imageBuffer: any): void;
    /**
     * Fills the given key with an image from a file.
     *
     * @param {number} keyIndex The key to fill 0 - 14
     * @param {String} filePath A file path to an image file
     * @returns {Promise<void>} Resolves when the file has been written
     */
    fillImageFromFile(keyIndex: any, filePath: any): Promise<any>;
    /**
     * Fills the whole panel with an image in a Buffer.
     * The image is scaled to fit, and then center-cropped (if necessary).
     *
     * @param {Buffer|String} imagePathOrBuffer
     * @param {Object} [sharpOptions] - Options to pass to sharp, necessary if supplying a buffer of raw pixels.
     * See http://sharp.dimens.io/en/latest/api-constructor/#sharpinput-options for more details.
     */
    fillPanel(imagePathOrBuffer: any, sharpOptions: any): Promise<any>;
    /**
     * Clears the given key.
     *
     * @param {number} keyIndex The key to clear 0 - 14
     * @returns {undefined}
     */
    clearKey(keyIndex: any): void;
    /**
     * Clears all keys.
     *
     * returns {undefined}
     */
    clearAllKeys(): void;
    /**
     * Sets the brightness of the keys on the Stream Deck
     *
     * @param {number} percentage The percentage brightness
     */
    setBrightness(percentage: any): void;
    /**
     * Writes a Stream Deck's page 1 headers and image data to the Stream Deck.
     *
     * @private
     * @param {number} keyIndex The key to write to 0 - 14
     * @param {Buffer} buffer Image data for page 1
     * @returns {undefined}
     */
    _writePage1(keyIndex: any, buffer: any): any;
    /**
     * Writes a Stream Deck's page 2 headers and image data to the Stream Deck.
     *
     * @private
     * @param {number} keyIndex The key to write to 0 - 14
     * @param {Buffer} buffer Image data for page 2
     * @returns {undefined}
     */
    _writePage2(keyIndex: any, buffer: any): any;
}
