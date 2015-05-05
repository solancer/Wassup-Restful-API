var crypto = require('crypto');
var rc4 = require('./rc4');

function KeyStream(key, macKey) {
	//this.cipher = crypto.createCipheriv('rc4', key, new Buffer(''));
	//this.key    = key;
	this.seq=0;
	this.macKey = macKey;
	var drop = 0x300; //768
	this.rc4engine = new rc4.Engine();
	this.rc4engine.init(key);
	this.rc4engine.drop(0x300);
}

KeyStream.prototype.computeMac = function(buffer, offset, length){
  // $hmac = hash_init("sha1", HASH_HMAC, $this->macKey);
  // hash_update($hmac, substr($buffer, $offset, $length));
  // $array = chr($this->seq >> 24)
  //     . chr($this->seq >> 16)
  //     . chr($this->seq >> 8)
  //     . chr($this->seq);
  // hash_update($hmac, $array);
  // $this->seq++;
  // return hash_final($hmac, true);
	
  var hmac  = crypto.createHmac('sha1', this.macKey);
	hmac.update(buffer.slice(offset,offset+length));
	
	var updateBuffer = new Buffer([this.seq >> 24, (this.seq >> 16)%256, (this.seq >> 8)%256, (this.seq)%256]);	
	hmac.update(updateBuffer);
	
	this.seq++;	
	return hmac.digest();
};

//WAUTH-2
KeyStream.prototype.encodeMessage = function(buffer, macOffset, offset, length){
		var data = this.rc4engine.cipher(buffer, offset, length);
		var mac = this.computeMac(data, offset, length);
		return Buffer.concat( [data.slice(0, macOffset), mac.slice(0,4), data.slice(macOffset + 4)] );
};

//WAUTH-2
KeyStream.prototype.decodeMessage = function(buffer, macOffset, offset, length){
		var mac = this.computeMac(buffer, offset, length);
		var decoded = this.rc4engine.cipher(buffer, offset, length);
		return decoded.slice(0, length);
};

function pbkdf2(password, salt, iterations, length) {
	iterations = iterations || 16;
	length     = length || 20;

	return crypto.pbkdf2Sync(password, salt, iterations, length);
}

exports.KeyStream = KeyStream;
exports.pbkdf2    = pbkdf2;