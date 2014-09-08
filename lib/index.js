// Load modules

var Hoek = require('hoek');

// Declare internals

var internals = {};

internals.buildQueues = function (events) {

	var result = {};
	var subs = Object.keys(events);
	for (var i = 0, il = subs.length; i < il; ++i) {
		var key = subs[i];
		result[key] = Array.isArray(events[key]) ? events[key] : [];
	}
	return result;
};


module.exports = internals.GoodReporter = function (options) {

	Hoek.assert(this.constructor === internals.GoodReporter
		|| this.constructor.super_ === internals.GoodReporter, 'GoodReporter must be created with new');

	options = options || {};
	var settings = Hoek.clone(options);
	var events = settings.events || {
		request: [],
		log: []
	};

	this._eventQueue = [];
	this._events = internals.buildQueues(events);

	// We don't with this exposed beyond the constructor
	delete settings.events;
	this._settings = settings;
};


internals.GoodReporter.prototype.start = function (callback) {

	return callback(null);
};


internals.GoodReporter.prototype.stop = function (callback) {

	return callback(null);
};

internals.GoodReporter.prototype._filter = function (event, eventData) {

	var subEventTags = this._events[event];

	// If we aren't interested in this event, break
	if (!subEventTags) {
		return false;
	}

	// If it's an empty array, we do not want to do any filtering
	if (subEventTags.length === 0) {
		return true;
	}

	// Check event tags to see if one of them is in this reports list
	if (Array.isArray(eventData.tags)) {
		var result = false;
		for (var i = 0, il = eventData.tags.length; i < il; ++i) {
			var eventTag = eventData.tags[i];
			result = result || subEventTags.indexOf(eventTag) > -1;
		}

		return result;
	}

	return false;
};


internals.GoodReporter.prototype.queue = function (event, eventData) {

	if (this._filter(event, eventData)) {
		this._eventQueue.push(eventData);
	}
};
