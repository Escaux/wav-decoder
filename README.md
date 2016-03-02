# WAV decoder

> UNRELEASED

This repository contains a fork of [wav-decoder](https://github.com/mohayonao/wav-decoder) made by [Nao Yonamine](mailto:mohayonao@gmail.com), an universal WAV data decoder.

## Installation

```shell
npm install git://github.com/escaux/wav-decoder
```

## Basic usage

```js
var fs = require('fs'),
	WavDecoder = require('wav-decoder');

// Wrapper around fs#readFile to return a Promise
function readFile(filepath) {
	return new Promise(function(resolve, reject) {
		fs.readFile(filepath, function(err, buffer) {
			if (err) return reject(err);
			return resolve(buffer);
		});
	});
}

// Read your WAV file
readFile("test.wav")

// Decode from your buffer (in node.js we convert Buffer to ArrayBuffer)
.then(function(buffer) {
	return WavDecoder.decode(new Uint8Array(buffer).buffer);
})

// Then your data are there
.then(function(data) {
	console.log(data.sampleRate);
	console.log(data.channelData[0]); // Float32Array
	console.log(data.channelData[1]); // Float32Array
});

```

## License

MIT

Refactored with ♥ by [Raphael Medaer](mailto:rme@escaux.com)
