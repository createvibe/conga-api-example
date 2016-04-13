'use strict';

// local libs
var HttpError = require('./HttpError');

/**
 * Error class for all request validation errors
 *
 * @Rest:Object
 *
 * @constructor
 */
function ValidationError() {
    HttpError.apply(this, arguments);
}

Conga.inherits(ValidationError, HttpError, {
    /**
     * {@inheritdoc}
     */
    message: 'Validation Error',

    /**
     * {@inheritdoc}
     * @Rest:SerializeMethod
     */
    toJSON: function toJSON() {
        return HttpError.prototype.toJSON.apply(this, arguments);
    }
});

module.exports = ValidationError;