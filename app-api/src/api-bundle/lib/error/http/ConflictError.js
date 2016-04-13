'use strict';

// local libs
var HttpError = require('./HttpError');

/**
 * Error class for all resource conflict errors (ie. document already exists)
 *
 * @Rest:Object
 *
 * @constructor
 */
function ConflictError() {
    HttpError.apply(this, arguments);
}

Conga.inherits(ConflictError, HttpError, {
    /**
     * {@inheritdoc}
     */
    message: 'Resource Conflict',

    /**
     * {@inheritdoc}
     * @Rest:SerializeMethod
     */
    toJSON: function toJSON() {
        return HttpError.prototype.toJSON.apply(this, arguments);
    }
});

module.exports = ConflictError;