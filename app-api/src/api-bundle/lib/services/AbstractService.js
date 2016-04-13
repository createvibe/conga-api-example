'use strict';

// third party libs
var Q = require('q');

// local libs
var InvalidArgumentError = require('../error/InvalidArgumentError'),
    HttpError = require('../error/http/HttpError'),
    NotFoundError = require('../error/http/NotFoundError'),
    ValidationError = require('../error/http/ValidationError'),
    ConflictError = require('../error/http/ConflictError');

/**
 * AbstractService for common business logic
 * @param {Container} container The service container
 * @abstract
 * @constructor
 */
function AbstractService(container) {
    this.container = container;
}

AbstractService.prototype = {
    /**
     * The service container
     * @type {Container}
     */
    container: null,

    /**
     * Get a service from the container
     * @param {string} key The name of the service to get
     * @returns {*|null}
     */
    get: function get(key) {
        if (this.container && this.container.has(key)) {
            return this.container.get(key);
        } else {
            console.trace();
            console.error('Unable to load service, "' + key + '".');
            return null;
        }
    },

    /**
     * Get a parameter from the service container
     * @param {string} key The name of the parameter to get
     * @returns {*}
     */
    getParameter: function getParameter(key) {
        if (this.container) {
            return this.container.getParameter(key);
        }
        return null;
    },

    /**
     * Create and return an invalid argument error
     * @param {string} message The error message
     * @returns {InvalidArgumentError}
     */
    createInvalidArgumentError: function createInvalidArgumentError(message) {
        return new InvalidArgumentError(message);
    },

    /**
     * Create and return a generic http error (500)
     * @param {string|Array<string>} errors The error array
     * @param {string} message The error message
     * @returns {HttpError}
     */
    createHttpError: function createHttpError(errors, message) {
        return new HttpError(errors, message);
    },

    /**
     * Create and return a resource conflict error
     * @param {string} message The error message
     * @returns {ConflictError}
     */
    createConflictError: function createConflictError(message) {
        return new ConflictError(message);
    },

    /**
     * Create and return a not found error (404)
     * @param {string} message The error message
     * @returns {NotFoundError}
     */
    createNotFoundError: function createNotFoundError(message) {
        return new NotFoundError(message);
    },

    /**
     * Create and return a validation error (400)
     * @param {string|Array<string>} errors The error array
     * @param {string} message The error message
     * @returns {ValidationError}
     */
    createValidationError: function createValidationError(errors, message) {
        return new ValidationError(errors, message);
    },

    /**
     * Ensure that a good manager is passed in for reuse
     * @param {Manager|false|null|undefined} manager The manager to ensure
     * @param {string} [type] The expected manager type
     * @returns {Promise}
     */
    ensureManager: function ensureManager(manager, type) {
        var self = this,
            deferred = Q.defer();

        if (!type) {
            type = 'mongodb.default';
        }

        if (!manager || !manager.definition || manager.definition.managerName !== type) {
            self.createManager(type, function(manager) {
                if (manager) {
                    deferred.resolve({
                        manager: manager,
                        isNew: true
                    });
                } else {
                    deferred.reject(new Error('Unable to create manager for ' + type));
                }
            });
        } else {
            deferred.resolve({
                manager: manager,
                isNew: false
            });
        }

        return deferred.promise;
    },

    /**
     * Create a Bass manager
     * @param {string} [type] The manager name, defaults to 'mongodb.default'
     * @param {Function} [cb] The callback function
     * @returns {Manager} The Bass manager
     */
    createManager: function createManager(type, cb) {
        if (!type) {
            type = 'mongodb.default';
        }
        var manager = this.container.get('bass').createSession().getManager(type);
        if (typeof cb === 'function') {
            cb(manager);
        }
        return manager;
    }
};

AbstractService.prototype.constructor = AbstractService;

module.exports = AbstractService;
