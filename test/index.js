var Lab = require('lab');
var lab = exports.lab = Lab.script();
var GoodReporter = require('..');

var describe = lab.describe;
var it = lab.it;
var expect = Lab.expect;

describe('good-reporter', function () {

    it('throws an error without using new', function(done) {

        expect(function() {

            var reporter = GoodReporter();
        }).to.throw('GoodReporter must be created with new');

        done();
    });

    it('provides a start function', function (done) {

        var reporter = new GoodReporter();
        expect(reporter.start).to.exist;

        reporter.start(function (error) {

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

    describe('queue()', function () {

        it('adds an item to the internal list if _filter returns true', function (done) {

            var reporter = new GoodReporter({
                events: {
                    'error': '*'
                }
            });

            reporter.queue('error', { data: 'some event data'});

            expect(reporter._eventQueue.length).to.equal(1);
            done();
        });

        it('does not add an item to the internal list if _filter returns false', function (done) {

            var reporter = new GoodReporter({
                events: {
                    request: '*'
                }
            });

            reporter.queue('error', { data: 'some event data', timestamp: Date.now() });

            expect(reporter._eventQueue.length).to.equal(0);
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
});
