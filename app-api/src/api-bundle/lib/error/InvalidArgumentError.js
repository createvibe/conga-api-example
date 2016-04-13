'use strict';

/**
 * Error class for all request validation errors
 *
 * @Rest:Object
 *
 * @constructor
 */
function InvalidArgumentError() {
    Error.apply(this, arguments);
}

Conga.inherits(InvalidArgumentError, Error, {
    /**
     * {@inheritdoc}
     * @Rest:SerializeMethod
     */
    toJSON: function toJSON() {
        return {error: this.message};
    }
});

module.exports = InvalidArgumentError;