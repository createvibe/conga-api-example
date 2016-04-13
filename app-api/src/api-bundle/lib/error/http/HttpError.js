'use strict';

/**
 * The HttpError class used for all HTTP error types
 *
 * @Rest:Object
 *
 * @param {string|Array<string>} errors Error message(s)
 * @param {string} [msg] The main error message
 * @constructor
 */
function HttpError(errors, msg) {
    if (arguments.length === 1) {
        if (errors instanceof Array) {
            this.errors = errors;
            if (errors.length !== 0) {
                this.message = errors[0];
            }
        } else {
            this.errors = [errors];
            this.message = errors;
        }
    } else {
        if (!(errors instanceof Array)) {
            errors = [errors];
        }
        this.errors = errors;
        this.message = msg;
    }
    Error.call(this, this.message);
    this.name = this.constructor.name;
}

Conga.inherits(HttpError, Error, {
    /**
     * Array of errors
     * @type {Array<string>}
     */
    errors: null,

    /**
     * The main error message
     * @type {string}
     */
    message: 'HTTP Error',

    /**
     * Serialize this error
     *
     * @Rest:SerializeMethod
     *
     * @returns {Object}
     */
    toJSON: function toJSON() {
        return {
            message: this.message,
            errors: this.errors
        };
    }
});

module.exports = HttpError;