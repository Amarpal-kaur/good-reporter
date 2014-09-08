var Lab = require('lab');
var lab = exports.lab = Lab.script();
var GoodBox = require('../');

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Lab.expect;

describe('good-box', function () {

    it('throws an error without using new', function(done) {

        expect(function() {

            var box = GoodBox();
        }).to.throw('GoodBox must be created with new');

        done();
    });

    it('provides a start function', function (done) {

        var box = new GoodBox();
        expect(box.start).to.exist;

        box.start(function (error) {
            expect(error).to.not.exist;
            done();
        });
    });

    it('provides a stop function', function (done) {

        var box = new GoodBox();
        expect(box.stop).to.exist;

        box.stop(function (error) {
            expect(error).to.not.exist;
            done();
        });
    });

    describe('filter', function () {

        it('returns true if this reporter should report this event type', function (done) {

            var box = new GoodBox({});
            expect(box.filter('log')).to.equal(true);
            done();
        });

        it('returns false if this report should not report this event type', function (done) {

            var box = new GoodBox({
                tags: ['ops']
            });
            expect(box.filter('request')).to.equal(false);
            done();
        });

        it('returns false if the tag is missing', function (done) {

            var box = new GoodBox();
            expect(box.filter()).to.equal(false);
            done();
        });
    });

    describe('report', function () {

        it('logs a message to the console if the tag event matches', function (done) {

            var log = console.log;

            console.log = function (value) {

                console.log = log;
                expect(value).to.equal('example log');
                done();
            };
            var box = new GoodBox({
                tags: ['ops']
            });

            box.report('ops', 'example log', function (error) {

                expect(error).to.not.exist;
            });
        });

        it('does not report a message if the tag even does not match', function (done) {


            var box = new GoodBox({
                tags: ['ops']
            });

            box.report('report', 'example log', function (error) {

                expect(error).to.not.exist;
                done();
            });
        });
    });
});