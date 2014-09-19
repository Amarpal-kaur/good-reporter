# good-reporter

Basic interface for [good](https://github.com/hapijs/good) reporter plugins.

![Build Status](https://travis-ci.org/hapijs/good-reporter.svg?branch=master) ![Current Version](https://img.shields.io/npm/v/good-reporter.svg)

Lead Maintainer: [Adam Bretz](https://github.com/arb)

## Usage

This is an abstraction module for implementing reporters for the [good](https://github.com/hapijs/good) process monitor plugin. It is generally used as a base object and varioues methods are over written for different reporters.

## Good Reporter
### new GoodReporter ([options])

creates a new GoodReporter object with the following arguments
- `[options]` - optional arguments object
	- `[events]` - an object of key value paris. Defaults to `{ request: "*", log: "*" }` meaning `request` and `log` events with no tag filtering.
		- `key` - one of ("request", "log", "error", or "ops") indicating the hapi event to subscribe to
		- `value` - an array of tags to filter incoming events. "*" indicates no filtering.

### `GoodReporter` methods
- `start(callback)` - starts the reporter. Any "run once" logic should be in the start method. For example, creating a database connection.
- `stop(callback)` - stops the reporter. Should be used for any tear down logic such as clearing time outs or disconnecting from a database.
- `_filter(event, eventData)` - _private_ method for filtering incoming events. Looks into `options.events` for a match on `event` and then further filters by the tags compared to `eventData.tags`. Returns `true` if the `event` + `[eventData.tags]` should be enqueued. You should never need to call `_filter` directly.
- `queue(event, eventData)` - adds `eventData` to the internal event queue (`_events`) if `_filter` returns `true`.

## Examples

Every new reporter *must* implement:

1. A `report(callback)` method. This is where the logic of exactly how this reporter moves data from the internal event queue to a destination lives. Execute the callback at the end of processing. Unless you want to continue to rebroadcast the same events, empty the event queue before running `callback`.

Everything else can be optional depending on the specific transmission method of `report`.

### "One Off" object

Below is a simple "one off" good-reporter object.

```javascript
var GoodReporter = require('good-reporter');

var reporter = new GoodReporter();
reporter.report = function (callback) {
	for (var i = 0, il = this._events.length; i < il; ++i) {

 		var event = this._events[i];
		console.info(JSON.parse(event));
	}
};
```

### Reusable Reporter

If you are looking to create a custom and reusable reporter for [good](https://github.com/hapijs/good), your new object needs to inherit from `good-reporter`. You will also need to implement a `report(callback)` as well.

```javascript
var GoodReporter = require('good-reporter');
var Util = require('util');

var internals = {};

module.exports = internals.GoodTwitter = function (options) {

	GoodReporter.call(this, options);

	this._hashTag = "#goodlogs";
	this._account = "hapijs";
};

Hoek.inherits(internals.GoodFile, GoodTwitter);

internals.GoodTwitter.prototype.stop = function (callback) {

	// Send a final Tweet for the day, then close the open connection
	callback(null);
};


internals.GoodTwitter.prototype.report = function (callback) {
	// Post your good logs to your twitter account
	callback(null);
};
```

In this example, you need to call the `GoodReporter` constructor to set up the internal state. Afterward you can write any custom logic that your specific broadcaster needs.
