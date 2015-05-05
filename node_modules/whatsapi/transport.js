var net = require('net');

function Socket() {
	this.callbacks = {
		receive : null,
		error   : null,
		end     : null
	};
}

Socket.prototype.connect = function(host, port, callback, thisarg) {
	this.socket = net.connect({
		port : port,
		host : host
	}, callback && callback.bind(thisarg));

	this.socket.on('error', function() {
		this.callbacks.error && this.callbacks.error.apply(this, arguments);
	}.bind(this));

	this.socket.on('end', function() {
		this.callbacks.end && this.callbacks.end.apply(this, arguments);
	}.bind(this));

	this.socket.on('data', function() {
		this.callbacks.receive && this.callbacks.receive.apply(this, arguments);
	}.bind(this));
};

Socket.prototype.send = function(data) {
	if(!this.socket) {
		throw 'Trying to send data whilst no connection established';
	}

	this.socket.write(data);
};

Socket.prototype.disconnect = function() {
	if(!this.socket) {
		return;
	}

	this.socket.removeAllListeners();
	this.socket.destroy();

	this.socket = null;
};

Socket.prototype.onReceive = function(callback, thisarg) {
	this.callbacks.receive = callback.bind(thisarg);
};

Socket.prototype.onError = function(callback, thisarg) {
	this.callbacks.error = callback.bind(thisarg);
};

Socket.prototype.onEnd = function(callback, thisarg) {
	this.callbacks.end = callback.bind(thisarg);
};

exports.Socket = Socket;
