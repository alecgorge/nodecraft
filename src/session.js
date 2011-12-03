var EventEmitter = require('events').EventEmitter;
var sys = require('util');


var Session = function (world, stream) {
	this.world = world;
	this.stream = stream;
	this.uid = world.uidgen.allocate();
	this.outgoingQueue = [];
	this.closed = false;
};

Session.prototype = new EventEmitter();

/* pump the outgoing message queue */
Session.prototype.pump = function () {
	if (!this.outgoingQueue.length) {
		return;
	}

	var item = this.outgoingQueue.shift();
	var me = this;

	// Cancel all low-priority sends if the client has disconnected
	if (this.closed) {
		this.outgoingQueue = [];
		return;
	}

	// Defer the next low-priority item for better server responsiveness
	item(function () {
		process.nextTick(function () {
			me.pump();
		});
	});
};

Session.prototype.addOutgoing = function (tocall) {
	this.outgoingQueue.push(tocall);
};

exports.Session = Session;
