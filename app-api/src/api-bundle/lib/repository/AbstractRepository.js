'use strict';

// third-party libs
var ObjectID = require('mongodb').ObjectID;

/**
 * AbstractRepository provides common functionality for all repository classes
 * @constructor
 */
function AbstractRepository() {
    // empty
}

/**
 * See if an id is in a valid format for this adapter
 * @param {String} id The object id to validate
 * @returns {boolean}
 */
AbstractRepository.prototype.validateIdField = function validateIdField(id) {
    return ObjectID.isValid(id);
};

module.exports = AbstractRepository;