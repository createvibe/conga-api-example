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
function NotFoundError() {
    HttpError.apply(this, arguments);
}

Conga.inherits(NotFoundError, HttpError, {
    /**
     * {@inheritdoc}
     */
    message: 'HTTP Not Found Error',

    /**
     * {@inheritdoc}
     * @Rest:SerializeMethod
     */
    toJSON: function toJSON() {
        return HttpError.prototype.toJSON.apply(this, arguments);
    }
});

module.exports = NotFoundError;