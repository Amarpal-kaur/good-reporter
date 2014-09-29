var EventEmitter = require('events').EventEmitter;
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var GoodReporter = require('..');

var describe = lab.describe;
var it = lab.it;
var expect = Lab.expect;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;


var ee;

beforeEach(function (done) {

    ee = new EventEmitter();
    done();
});

afterEach(function (done) {

    ee.removeAllListeners();
    done();
});



it('throws an error without using new', function(done) {

    expect(function() {

        var reporter = GoodReporter();
    }).to.throw('GoodReporter must be created with new');

    done();
});

it('provides a start function', function (done) {

    var reporter = new GoodReporter();
    expect(reporter.start).to.exist;

    reporter.start(ee, function (error) {

        expect(error).to.not.exist;
        done();
    });
});

it('provides a stop function', function (done) {

    var reporter = new GoodReporter();
    expect(reporter.stop).to.exist;

    reporter.stop(function (error) {

        expect(error).to.not.exist;
        done();
    });
});

it('converts non-array values to empty tag arrays', function (done) {

    var tagValues = [null, '*', 'none', 5];

    for (var i = 0, il = tagValues.length; i < il; ++i) {
        var tag = tagValues[i];

        var reporter = new GoodReporter({
            events: {
                error: tag
            }
        });

        expect(reporter._events.error).to.deep.equal([]);
    }

    done();
});

describe('_filter()', function () {

    it('returns true if this reporter should report this event type', function (done) {

        var reporter = new GoodReporter();

        expect(reporter._filter('log', {
            tags: ['request', 'server', 'error', 'hapi']
        })).to.equal(true);

        done();
    });

    it('returns false if this report should not report this event type', function (done) {

        var reporter = new GoodReporter();

        expect(reporter._filter('ops', {
            tags: '*'
        })).to.equal(false);

        done();
    });

    it('returns true if the event is matched, but there are not any tags with the data', function (done) {

        var reporter = new GoodReporter();
        expect(reporter._filter('log', {
            tags:[]
        })).to.equal(true);

        done();
    });

    it('returns false if the event is not matched', function (done) {

        var reporter = new GoodReporter();
        expect(reporter._filter('ops', {
            tags:[]
        })).to.equal(false);

        done();
    });

    it('returns false if the subscriber has tags, but the matched event does not have any', function (done) {

        var reporter = new GoodReporter({
            events: {
                error: ['db']
            }
        });

        expect(reporter._filter('error', {
            tags:[]
        })).to.equal(false);

        done();
    });

    it('returns true if the event and tag match', function (done) {

        var reporter = new GoodReporter({
            events: {
                'error': ['high', 'medium', 'log']
            }
        });

        expect(reporter._filter('error', {
            tags: ['hapi', 'high', 'db', 'severe']
        })).to.equal(true);
        done();
    });

    it('returns false by default', function (done) {

       var reporter = new GoodReporter({
           events: {
               request: ['hapi']
           }
       });

        expect(reporter._filter('request',{})).to.equal(false);
        done();
    });
});

describe('report()', function () {

    it('throws an error if when called directly', function (done) {

        var reporter = new GoodReporter({
            events: {
                request: '*'
            }
        });

        expect(function () {

            reporter.report();
        }).to.throw('Instance of GoodReporter must implement their own "report" function.');
        done();
    });

});

describe('handleEvent()', function() {

    it('runs when a matching event is emitted', function (done) {

        var reporter = new GoodReporter({
            events: {
                request: '*',
                ops: '*',
                log: '*',
                error: '*'
            }
        });
        var i = 1;
        var hash = {
            1:{
                name: 'request',
                value: {data:'request data'}
            },
            2: {
                name: 'ops',
                value: { data:'ops data' }
            },
            3: {
                name: 'log',
                value: { data:'log data' }
            },
            4: {
                name: 'error',
                value: { data:'error data' }
            }
        };

        reporter.report = function (event, eventData) {

            expect(hash[i].name).to.equal(event);
            expect(hash[i].value).to.deep.equal(eventData);
            i++;

            if (i > 4) {
                ee.removeAllListeners();
                return done();
            }
        };

        reporter.start(ee, function (err) {

            expect(err).to.not.exist;

            ee.emit('request','request', { data:'request data' });
            ee.emit('ops','ops', { data:'ops data' });
            ee.emit('log','log', { data:'log data' });
            ee.emit('error','error', { data:'error data' });
        });

    });

    it('does not call report if the event is not matched', function (done) {


        var reporter = new GoodReporter({
            events: {
                request: ['user']
            }
        });

        reporter.report = function (event, eventData) {

            throw new Error('report called.');
        };

        reporter.start(ee, function (err) {
            expect(err).to.not.exist;

            expect(function() {
                ee.emit('request','request', { data:'request data' });
            }).to.not.throw('report called.');
            done();
        });
    });
});
