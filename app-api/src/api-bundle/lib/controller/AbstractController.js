'use strict';

// local libs
var AbstractService = require('./../services/AbstractService');

/**
 * The AbstractController provides common functionality for all controllers
 * @abstract
 * @constructor
 */
function AbstractController() {
    // empty
}

AbstractController.prototype = {
    /**
     * @see AbstractService.prototype.get
     */
    get: function get() {
        return AbstractService.prototype.get.apply(this, arguments);
    },

    /**
     * @see AbstractService.createInvalidArgumentError
     */
    createInvalidArgumentError: function createInvalidArgumentError() {
        return AbstractService.prototype.createInvalidArgumentError.apply(this, arguments);
    },

    /**
     * @see AbstractService.createHttpError
     */
    createHttpError: function createHttpError() {
        return AbstractService.prototype.createHttpError.apply(this, arguments);
    },

    /**
     * @see AbstractService.createNotFoundError
     */
    createNotFoundError: function createNotFoundError() {
        return AbstractService.prototype.createNotFoundError.apply(this, arguments);
    },

    /**
     * @see AbstractService.createValidationError
     */
    createValidationError: function createValidationError() {
        return AbstractService.prototype.createValidationError.apply(this, arguments);
    },

    /**
     * Send an error response back to the client
     * @param {Error} err
     * @param res
     */
    sendErrorResponse: function sendErrorResponse(err, res) {
        var json = err.toJSON ? err.toJSON() : {error: err.message};
        switch (err.name) {
            case 'ValidationError' :
                res.BAD_REQUEST(json);
                break;

            case 'InvalidArgumentErorr' :
                res.BAD_REQUEST(json);
                break;

            case 'NotFoundError' :
                res.NOT_FOUND(json);
                break;

            case 'ConflictError' :
                res.CONFLICT(json);
                break;

            default :
            case 'HttpError' :
                if (!err.stack) {
                    console.trace();
                }
                this.get('logger').error(err.stack || err);
                res.INTERNAL_SERVER_ERROR(json);
                break;
        }
    },

    /**
     * Create an error callback for a request
     * @param {Object} res The express response object
     * @param {string} [message] The default message
     * @returns {(function(this:AbstractController))|Function}
     */
    createErrorCallback: function createErrorCallback(res, message) {
        return (function(err) {
            if (typeof err === 'string') {
                err = this.createHttpError(err);
            } else if (!err) {
                err = this.createHttpError(message || 'Internal Server Error');
            }
            this.sendErrorResponse(err, res);
        }.bind(this));
    }
};

AbstractController.prototype.constructor = AbstractController;

module.exports = AbstractController;