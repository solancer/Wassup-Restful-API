// Messages submodule
// Includes functions for sending messages

var MediaType = require('../MediaType.js');
var protocol = require('../protocol.js');
var common = require('../common.js');
var fs = require('fs');
var crypto = require('crypto');
var WhatsApi = module.exports = function() {};

/**
 * @private
 */
WhatsApi.prototype.sendMessageNode = function(to, node, msgid, callback) {
	if (!this.loggedIn) {
		this.queue.push({to : to, node : node});
		return;
	}
	
	var messageId = msgid || this.nextMessageId('message');
	this.addCallback(messageId, callback);

	var attributes = {
		to   : this.createJID(to),
		type : (node.tag() === 'body' ? 'text' : 'media'),
		id   : messageId,
		t    : common.tstamp().toString()
	};

	var messageNode = new protocol.Node('message', attributes, [node]);

	this.sendNode(messageNode);
};

/**
 * Send a text message
 * @param {String} to              Recipient number or JID
 * @param {String} message         Message text content
 * @param {String} msgid           Message ID (optional)
 * @param {Function} callback      Called when the server receives the message
 * @fires clientReceived
 */
WhatsApi.prototype.sendMessage = function(to, message, msgid, callback) {
	// Convert arguments to array
	var args = [];
	for (var i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	
	// Remove first 2 required arguments
	args.splice(0, 2);
	
	// Get last argument
	callback = args.pop();
	
	// Get optional msgid
	if (args.length > 0) {
		msgid = args.shift();
	}
	else {
		msgid = null;
	}
	
	var bodyNode = new protocol.Node('body', null, null, message);
	this.sendMessageNode(to, bodyNode, msgid, callback);
};

/**
 * Send a location message
 * @param  {String}   to        Recipient number or JID
 * @param  {Number}   lat       Latitude
 * @param  {Number}   lng       Longitude
 * @param  {String}   name      Place name (optional)
 * @param  {String}   url       Place URL (optional)
 * @param  {String}   msgid     Message ID (optional)
 * @param  {Function} callback  Called when the server receives the message
 * @fires clientReceived
 */
WhatsApi.prototype.sendLocation = function(to, lat, lng, name, url, msgid, callback) {
	// Convert arguments to array
	var args = [];
	for (var i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	
	// Remove first 3 required arguments
	args.splice(0, 3);
	
	// Get last argument
	callback = args.pop();
	
	// Get optional name, url, msgid
	name  = args.length > 0 ? args.shift() : null;
	url   = args.length > 0 ? args.shift() : null;
	msgid = args.length > 0 ? args.shift() : null;
	
	var attributes = {
		encoding  : 'raw',
		type      : 'location',
		latitude  : lat.toString(),
		longitude : lng.toString()
	};
	
	if (name && url) {
		attributes['name'] = name;
		attributes['url'] = url;
	}
	
	var node = new protocol.Node('media', attributes);

	this.sendMessageNode(to, node, msgid, callback);
};


/**
 * Send an image to the specified destination. An optional caption an message ID can be specified.
 * 
 * @param  {String} to              Destination phone number in international format, without '+'. E.g. 491234567890
 * @param  {String} filepath        File path or URL of the image to send
 * @param  {String} caption         (optional) caption to display together with the image
 * @param  {String} msgid           (optional) message ID
 * @param  {Function} callback      Called when the server receives the message
 * @fires clientReceived
 * @example
 * wa.sendImage('491234567890', 'http://lorempixel.com/800/600/?.jpg', 'This is a caption');
 */
WhatsApi.prototype.sendImage = function(to, filepath, caption, msgid, callback) {
	// Convert arguments to array
	var args = [];
	for (var i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	
	// Remove first 2 required arguments
	args.splice(0, 2);
	
	// Get last argument
	callback = args.pop();
	
	// Get optional caption and msgid
	caption = args.length > 0 ? args.shift() : null;
	msgid = args.length > 0 ? args.shift() : null;
	
	this.sendMedia(to, filepath, MediaType.IMAGE, caption, msgid, callback);
};

/**
* Send a video to the specified destination. An optional caption an message ID can be specified.
* 
* @param  {String} to           Destination phone number in international format, without '+'. E.g. 491234567890
* @param  {String} filepath     File path or URL of the video to send
* @param  {String} caption      (optional) caption to display together with the video
* @param  {String} msgid        (optional) message ID
* @param  {Function} callback   Called when the server receives the messages
* @fires clientReceived
* @example
* wa.sendVideo('491234567890','http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4', 'Big Buck Bunny');
*/
WhatsApi.prototype.sendVideo = function(to, filepath, caption, msgid, callback) {
	// Convert arguments to array
	var args = [];
	for (var i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	
	// Remove first 2 required arguments
	args.splice(0, 2);
	
	// Get last argument
	callback = args.pop();
	
	// Get optional caption and msgid
	caption = args.length > 0 ? args.shift() : null;
	msgid = args.length > 0 ? args.shift() : null;
	
	this.sendMedia(to, filepath, MediaType.VIDEO, caption, msgid, callback);
};

/**
 * Send an audio file to the specified destination.
 * 
 * @param  {String} to            Destination phone number in international format, without '+'. E.g. 491234567890
 * @param  {String} filepath      File path or URL of the audio file to send
 * @param  {String} msgid         (optional) message ID
 * @param  {Function} callback    Called when the server receives the messages
 * @fires clientReceived
 * @example
 * wa.sendAudio('491234567890', 'http://archive.org/download/Exodus1KJV/02001_Exodus_1.mp3');
 */
WhatsApi.prototype.sendAudio = function(to, filepath, msgid, callback) {
	// Convert arguments to array
	var args = [];
	for (var i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	
	// Remove first 2 required arguments
	args.splice(0, 2);
	
	// Get last argument
	callback = args.pop();
	
	// Get optional msgid
	msgid = args.length > 0 ? args.shift() : null;
	
	this.sendMedia(to, filepath, MediaType.AUDIO, null, msgid, callback);
};

WhatsApi.prototype.sendMedia = function(to, filepath, type, caption, msgid, callback) {
	this.getMediaFile(filepath, type, function(err, path) {
		if (err) {
			var errorObj = {
				code: 100,
				message: err
			}
			callback(errorObj);
			return;
		}

		var stat = fs.statSync(path);
		var mediaContent = fs.readFileSync(path);
		var hash = crypto.createHash('sha256').update(mediaContent).digest('base64');
		
		// An upload node will be generated
		// And the image data added to the media queue
		var uploadNode = this.createRequestMediaUploadNode(hash, type, stat.size, path, to, caption, msgid, callback);

		this.sendNode(uploadNode);
	}.bind(this));
};

/**
 * Send a vCard file to the specified destination.
 * 
 * @param  {String} to           Destination phone number in international format, without '+'. E.g. 491234567890
 * @param  {String} filepath     File path or URL of the vCard file to send
 * @param  {String} name         Name of the person in the vcard
 * @param  {String} msgid        (optional) message ID
 * @param  {Function} callback   Called when the server receives the messages
 * @fires clientReceived
 * @example
 * wa.sendVcard('491234567890', 'http://www.w3.org/2002/12/cal/vcard-examples/john-doe.vcf', 'John Doe');
 */
WhatsApi.prototype.sendVcard = function(to, filepath, name, msgid, callback) {
	// Convert arguments to array
	var args = [];
	for (var i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	
	// Remove first 3 required arguments
	args.splice(0, 3);
	
	// Get last argument
	callback = args.pop();
	
	// Get optional msgid
	msgid = args.length > 0 ? args.shift() : null;
	
	this.getMediaFile(filepath, MediaType.VCARD, function(err, path) {
		if (err) {
			var errorObj = {
				code: 100,
				message: err
			};
			callback(errorObj);
			return;
		}
		
		fs.readFile(path, function(err, data) {
			if (err) {
				var errorObj = {
					code: 100,
					message: 'Error reading downloaded file: ' + JSON.stringify(err)
				};
				callback(errorObj);
				return;
			}

			var vcardNode = new protocol.Node('vcard', { name: name }, null, data);
			var mediaNode = new protocol.Node('media', { type: 'vcard' }, [vcardNode]);
			
			this.sendMessageNode(to, mediaNode, msgid, callback);
			
		}.bind(this));
	}.bind(this));
};
