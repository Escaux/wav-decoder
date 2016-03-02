function BufferReader(buffer) {
	this.view = new DataView(buffer);
	this.length = this.view.byteLength;
	this.pos = 0;
}

BufferReader.prototype.skip = function(n) {
	for (var i = 0; i < n; i++) {
		this.view.getUint8(this.pos++);
	}
};

BufferReader.prototype.readUint8 = function() {
	var data = this.view.getUint8(this.pos);
	this.pos += 1;
	return data;
};

BufferReader.prototype.readInt16 = function() {
	var data = this.view.getInt16(this.pos, true);
	this.pos += 2;
	return data;
};

BufferReader.prototype.readUint16 = function() {
	var data = this.view.getUint16(this.pos, true);
	this.pos += 2;
	return data;
};

BufferReader.prototype.readUint32 = function() {
	var data = this.view.getUint32(this.pos, true);
	this.pos += 4;
	return data;
};

BufferReader.prototype.readString = function(len) {
	var data = "";
	for (var i = 0; i < len; i++) {
		data += String.fromCharCode(this.readUint8());
	}
	return data;
};

BufferReader.prototype.readPCM8 = function() {
	var data = (this.view.getUint8(this.pos) - 128) / 128;
	this.pos += 1;
	return data;
};

BufferReader.prototype.readPCM16 = function() {
	var data = this.view.getInt16(this.pos, true) / 32768;
	this.pos += 2;
	return data;
};

BufferReader.prototype.readPCM24 = function() {
	var x0 = this.view.getUint8(this.pos + 0);
	var x1 = this.view.getUint8(this.pos + 1);
	var x2 = this.view.getUint8(this.pos + 2);
	var xx = x0 + (x1 << 8) + (x2  << 16);
	var data = ((xx & 0x800000) ? xx - 16777216 : xx) / 8388608;
	this.pos += 3;
	return data;
};

BufferReader.prototype.readPCM32 = function() {
	var data = this.view.getInt32(this.pos, true) / 2147483648;
	this.pos += 4;
	return data;
};

BufferReader.prototype.readPCM32F = function() {
	var data = this.view.getFloat32(this.pos, true);
	this.pos += 4;
	return data;
};

BufferReader.prototype.readPCM64F = function() {
	var data = this.view.getFloat64(this.pos, true);
	this.pos += 8;
	return data;
};

BufferReader.prototype.readPCM = function(channelData, length, format) {
	var numberOfChannels = format.numberOfChannels;
	var method = "readPCM" + format.bitDepth;

	if (format.floatingPoint) {
		method += "F";
	}

	if (!this[method]) {
		throw new Error("not suppoerted bit depth " + format.bitDepth);
	}

	for (var i = 0; i < length; i++) {
		for (var ch = 0; ch < numberOfChannels; ch++) {
			channelData[ch][i] = this[method]();
		}
	}
};

module.exports = BufferReader;
