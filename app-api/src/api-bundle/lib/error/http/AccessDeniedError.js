'use strict';

// local libs
var HttpError = require('./HttpError');

/**
 * Error class for all access denied errors
 *
 * @Rest:Object
 *
 * @constructor
 */
function AccessDeniedError() {
    HttpError.apply(this, arguments);
}

Conga.inherits(AccessDeniedError, HttpError, {
    /**
     * {@inheritdoc}
     */
    message: 'Access Denied',

    /**
     * {@inheritdoc}
     * @Rest:SerializeMethod
     */
    toJSON: function toJSON() {
        return HttpError.prototype.toJSON.apply(this, arguments);
    }
});

module.exports = AccessDeniedError;