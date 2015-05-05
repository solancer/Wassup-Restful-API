// Chat state submodule
// Includes functions for managing WhatsApp chat state and presence

var protocol = require('../protocol.js');
var WhatsApi = module.exports = function() {};

/**
 * Send online presence for the current user
 */
WhatsApi.prototype.sendIsOnline = function() {
	var attributes = {
		name : this.config.username
	};

	this.sendNode(new protocol.Node('presence', attributes));
};

/**
 * Send offline presence for the current user
 */
WhatsApi.prototype.sendIsOffline = function() {
	var attributes = {
		type : 'unavailable',
		name : this.config.username
	};

	this.sendNode(new protocol.Node('presence', attributes));
};

/**
 * Send composing state to the given user
 * @param  {String} to     Phone number
 */
WhatsApi.prototype.sendComposingState = function(to) {
	this.sendChatState(to, 'composing');
};

/**
 * Send stopped typing/composing to the given user
 * @param  {String} to     Phone number
 */
WhatsApi.prototype.sendPausedState = function(to) {
	this.sendChatState(to, 'paused');
};

WhatsApi.prototype.sendChatState = function(to, state) {
	var node = new protocol.Node(
		'chatstate',
		{
			to: this.createJID(to)
		},
		[
			new protocol.Node(state || 'paused')
		]
	);

	this.sendNode(node);
};

/**
 * Request subscription to presence of the given user
 * @param  {String} who    Phone number
 */
WhatsApi.prototype.sendPresenceSubscription = function(who) {
	var attributes = {
		type : 'subscribe',
		to : this.createJID(who)
	};
	var node = new protocol.Node('presence', attributes);
	
	this.sendNode(node);
};

/**
 * Requst unsubscription to presence for the given user
 * @param  {String} who    Phone number
 */
WhatsApi.prototype.sendPresenceUnsubscription = function(who) {
	var attributes = {
		type : 'unsubscribe',
		to : this.createJID(who)
	};
	var node = new protocol.Node('presence', attributes);
	
	this.sendNode(node);
};
