// Imports
var BufferReader = require('./BufferReader.js');

// Some constants ...
var formats = {
	0x0001: "lpcm",
	0x0003: "lpcm",
};

// Everything is so static in this world ...
var WavDecoder = {};

/**
 * Decode WAV stream with input buffer.
 * @param {Buffer} buffer - Buffer containing WAV to decode.
 * @return {Promise} - Decoded data within a Promise.
 */
WavDecoder.decode = function(buffer) {
	return WavDecoder.decodeWav(buffer)
	.then(function(data) {
		return {
			sampleRate: data.sampleRate,
			channelData: data.buffers.map(function(buffer) {
				return new Float32Array(buffer);
			}),
		};
	});
};

/**
 * Decode WAV data.
 * @param {Buffer} buffer - Buffer containing WAV to decode.
 * @return {Promise} - Gross decoded data.
 */
WavDecoder.decodeWav = function(buffer) {
	return new Promise(function(resolve) {
		var reader = new BufferReader(buffer);

		if (reader.readString(4) !== "RIFF") {
			throw new Error("Invalid WAV file");
		}

		reader.readUint32(); // file length

		if (reader.readString(4) !== "WAVE") {
			throw new Error("Invalid WAV file");
		}

		var format = null;
		var audioData = null;

		do {
			var chunkType = reader.readString(4);
			var chunkSize = reader.readUint32();
			switch (chunkType) {
				// NOTE: does the space in "fmt " is an error ???
				case "fmt ":
				format = WavDecoder.decodeFormat(reader, chunkSize);
				break;
				case "data":
				audioData = WavDecoder.decodeData(reader, chunkSize, format);
				break;
				default:
				reader.skip(chunkSize);
				break;
			}
		} while (audioData === null);

		return resolve(audioData);
	});
};

/**
 * Decode WAV format.
 * @param {BufferReader} reader - @see BufferReader
 * @param {integer} chunkSize
 * @return {object} - Format specifications within an object.
 */
WavDecoder.decodeFormat = function(reader, chunkSize) {
	var formatId = reader.readUint16();

	if (!formats.hasOwnProperty(formatId)) {
		throw new Error("Unsupported format in WAV file");
	}

	var format = {
		formatId: formatId,
		floatingPoint: formatId === 0x0003,
		numberOfChannels: reader.readUint16(),
		sampleRate: reader.readUint32(),
		byteRate: reader.readUint32(),
		blockSize: reader.readUint16(),
		bitDepth: reader.readUint16(),
	};
	reader.skip(chunkSize - 16);

	return format;
};

/**
 * Decode WAV data.
 * @param {BufferReader} reader - @see BufferReader
 * @param {integer} chunkSize
 * @param {object} format - @see WavDecoder#decodeFormat
 * @return {object} - Gross WAV data.
 */
WavDecoder.decodeData = function(reader, chunkSize, format) {
	var length = Math.floor(chunkSize / format.blockSize);
	var channelData = new Array(format.numberOfChannels);

	for (var ch = 0; ch < format.numberOfChannels; ch++) {
		channelData[ch] = new Float32Array(length);
	}

	reader.readPCM(channelData, length, format);

	var buffers = channelData.map(function(data) {
		return data.buffer;
	});

	return {
		numberOfChannels: format.numberOfChannels,
		length: length,
		sampleRate: format.sampleRate,
		buffers: buffers,
	};
};

module.exports = WavDecoder;
