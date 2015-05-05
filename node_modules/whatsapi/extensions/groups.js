// Groups submodule
// Includes functions for groups management

var protocol = require('../protocol.js');
var util = require('util');
var WhatsApi = module.exports = function() {};

/**
 * Request a filtered list of groups
 * @param {String}     type              (optional) Groups list filter, 'owning' or 'participating'
 * @param {GroupsListCallback} callback  Called when the response is received
 * @example
 * wa.requestGroupList(function(err, array) { });
 */
WhatsApi.prototype.requestGroupsList = function(type, callback) {
	type = type || 'participating';
	
	// Make the first argument optional
	if (typeof(type) === typeof(Function)) {
		callback = type;
		type = 'participating';
	}
	
	var messageId = this.nextMessageId('getgroups');
	
	this.addCallback(messageId, callback);

	var listNode = new protocol.Node(type);

	var attributes = {
		id    : messageId,
		type  : 'get',
		to    : this.config.gserver,
		xmlns : 'w:g2'
	};

	this.sendNode(new protocol.Node('iq', attributes, [listNode]));
};

/**
 * Request info for a group
 * @param {String} groupId              The ID of the group to request info for
 * @param {GroupInfoCallback} callback  Called when the response is received
 */
WhatsApi.prototype.requestGroupInfo = function(groupId, callback) {
	var messageId = this.nextMessageId('get_groupv2_info');
	
	this.addCallback(messageId, callback);
	
	var node = new protocol.Node(
		'iq',
		{
			id    : messageId,
			xmlns : 'w:g2',
			type  : 'get',
			to    : this.createJID(groupId)
		},
		[
			new protocol.Node(
				'query',
				{
					request : 'interactive'
				}
			)
		]
	);

	this.sendNode(node);
};

/**
 * Creates a new group
 * @param {String} subject   Subject/topic/name of the group
 * @param {Array<String>}  numbers  Array of phone numbers to be added as participants to the group
 * @param {GroupCreatedCallback} callback
 * @example
 * wa.createGroup('Group name', '39xxxxxxxxxx');
 * // or
 * wa.createGroup('Group name', ['39xxxxxxxxxx', '31xxxxxxxxxx']);
 */
WhatsApi.prototype.createGroup = function(subject, numbers, callback) {
	if (!util.isArray(numbers)) {
		numbers = [numbers];
	};
	
	var participants = numbers.map(function(n) {
		return new protocol.Node(
			'participant',
			{
				jid: this.createJID(n)
			}
		);
	}, this);
	
	var messageId = this.nextMessageId('creategroup');
	
	this.addCallback(messageId, callback);
	
	var node = new protocol.Node(
		'iq',
		// Attributes
		{
			xmlns : 'w:g2',
			id    : messageId,
			type  : 'set',
			to    : this.config.gserver
		},
		// Children
		[
			new protocol.Node(
				'create',
				{
					subject : subject
				},
				participants
			)
		]
	);

	this.sendNode(node);
};

/**
 * Add new participants to the group
 * @param {String} groupId  Group ID
 * @param {Array}  numbers  Array of participants numbers to add
 * @param {GroupParticipantsCallback} callback
 */
WhatsApi.prototype.addGroupParticipants = function(groupId, numbers, callback) {
	this.changeGroupParticipants(groupId, numbers, 'add', callback);
};

/**
 * Remove participants from the group
 * @param {String} groupId  Group ID
 * @param {Array}  numbers  Array of participants numbers to remove
 * @param {GroupParticipantsCallback} callback
 */
WhatsApi.prototype.removeGroupParticipants = function(groupId, numbers, callback) {
	this.changeGroupParticipants(groupId, numbers, 'remove', callback);
};

/**
 * Promote participants as admin of the group
 * @param {String} groupId  Group ID
 * @param {Array}  numbers  Array of participants numbers to promote
 * @param {GroupParticipantsCallback} callback
 */
WhatsApi.prototype.promoteGroupParticipants = function(groupId, numbers, callback) {
	this.changeGroupParticipants(groupId, numbers, 'promote', callback);
};

/**
 * Demote participants from being admin of the group
 * @param {String} groupId  Group ID
 * @param {Array}  numbers  Array of participants numbers to demote
 * @param {GroupParticipantsCallback} callback
 */
WhatsApi.prototype.demoteGroupParticipants = function(groupId, numbers, callback) {
	this.changeGroupParticipants(groupId, numbers, 'demote', callback);
};

/**
 * Do an 'action' on the given numbers in the given group
 * @param {String} groupId   Group ID
 * @param {Array}  numbers   Array of numbers to take the action on
 * @param {String} action    Action to execute on the numbers
 * @param {GroupParticipantsCallback} callback
 * @private
 */
WhatsApi.prototype.changeGroupParticipants = function(groupId, numbers, action, callback) {
	if (!Array.isArray(numbers)) {
		numbers = [numbers];
	}
	
	var participants = numbers.map(function(n) {
		return new protocol.Node(
			'participant',
			{
				jid: this.createJID(n)
			}
		)
	}, this);
	
	var messageId = this.nextMessageId(action + '_group_participants_');
	
	this.addCallback(messageId, callback);
	
	var node = new protocol.Node(
		'iq',
		{
			id    : messageId,
			type  : 'set',
			xmlns : 'w:g2',
			to    : this.createJID(groupId)
		},
		[
			new protocol.Node(action, null, participants)
		]
	);
	
	this.sendNode(node);
};

/**
 * Request to leave groups
 * @param {Array<String>} groupIds    Group IDs you want to leave
 * @param {GroupLeaveCallback} callback
 */
WhatsApi.prototype.requestGroupsLeave = function(groupIds, callback) {
	if (!Array.isArray(groupIds)) {
		groupIds = [groupIds];
	}
	
	var messageId = this.nextMessageId('leavegroups');
	
	this.addCallback(messageId, callback);
	
	var groupNodes = groupIds.map(function(id) {
		return new protocol.Node('group', { id : this.createJID(id) });
	}, this);

	var leaveNode = new protocol.Node('leave', { action : 'delete' }, groupNodes);

	var attributes = {
		id    : messageId,
		to    : this.config.gserver,
		type  : 'set',
		xmlns : 'w:g2'
	};

	this.sendNode(new protocol.Node('iq', attributes, [leaveNode]));
};

/**
 * Request to leave a single group
 * @param  {String}   groupId  Group ID you want to leave
 * @param  {GroupLeaveCallback} callback
 */
WhatsApi.prototype.requestGroupLeave = function(groupId, callback) {
	this.requestGroupsLeave([groupId], callback);
};

/**
 * Update the subject for the given group
 * @param {String} groupId    ID of the group you want to change the subject of
 * @param {String} subject    New subject/topic/name text
 * @param {GroupSubjectCallback} callback
 */
WhatsApi.prototype.setGroupSubject = function(groupId, subject, callback) {
	var messageId = this.nextMessageId('set_group_subject');
	
	this.addCallback(messageId, callback);
	
	var node = new protocol.Node(
		'iq',
		{
			id    : messageId,
			type  : 'set',
			to    : this.createJID(groupId),
			xmlns : 'w:g2'
		},
		[
			new protocol.Node('subject', null, null, subject)
		]
	);
	
	this.sendNode(node);
};

