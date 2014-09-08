// Load modules

var Hoek = require('hoek');

// Declare internals

var internals = {};


internals.defaults = {
    tags: ['request','log']
};


module.exports = internals.GoodBox = function (options) {

    Hoek.assert(this.constructor === internals.GoodBox, 'GoodBox must be created with new');

    this.settings = Hoek.applyToDefaults(internals.defaults, options);
};


internals.GoodBox.prototype.start = function (callback) {

    return callback(null);
};


internals.GoodBox.prototype.stop = function (callback) {

    return callback(null);
};

internals.GoodBox.prototype.report = function (tag, message, callback) {

    if(this.filter(tag)) {

        console.log(message);
    }
    return callback(null);
};

internals.GoodBox.prototype.filter = function (tag) {

    if (!tag || !tag.length) {
        return false;
    }

    tag = tag.toLowerCase();

    return this.settings.tags.indexOf(tag) > -1;
};