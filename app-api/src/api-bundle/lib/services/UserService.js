'use strict';

// core modules
var crypto = require('crypto');

// third party libs
var Q = require('q');

// local libs
var AbstractService = require('./AbstractService');

/**
 * The UserService handles business logic for user operations
 * @constructor
 */
function UserService() {
    AbstractService.apply(this, arguments);
}

// UserService extends AbstractService
Conga.inherits(UserService, AbstractService, {
    /**
     * Get a user from storage by id
     * @param {string|number} userId The user id to fetch
     * @param {Manager} [manager] The bass manager if you already have one
     * @returns {Promise}
     */
    getUserById: function getUserById(userId, manager) {
        var self = this,
            deferred = Q.defer();

        this.ensureManager(manager).then(function (ensure) {

            // get the user repository
            var repo = ensure.manager.getRepository('User');

            // validate the id
            if (!repo.validateIdField(userId)) {
                deferred.reject(self.createNotFoundError('Could not find user by id ' + userId));
                return;
            }

            // find the user by id
            repo.find(userId)
                .then(deferred.resolve)
                .fail(deferred.reject);

        }).fail(deferred.reject);

        return deferred.promise;
    },

    /**
     * Get users by criteria
     * @param {Object} criteria The criteria to search by
     * @param {Manager} [manager] The bass manager if you already have one
     * @returns {*|promise}
     */
    getUsersByCriteria: function getUsersByCriteria(criteria, manager) {
        var deferred = Q.defer();

        this.ensureManager(manager).then(function (ensure) {

            // find the user by id
            ensure.manager.getRepository('User')
                .findBy(criteria)
                .then(deferred.resolve)
                .fail(deferred.reject);

        }).fail(deferred.reject);

        return deferred.promise;
    },

    /**
     * Prepare a user for request
     * @param {User} user The User document to prepare
     * @param {Object} data Request data for user
     * @returns {User}
     * @throws ValidationError
     */
    prepareUserForRequest: function prepareUserForRequest(user, data) {
        // sanitize data
        if ('createdAt' in data) {
            delete data.createdAt;
        }
        if ('updatedAt' in data) {
            delete data.updatedAt;
        }
        if ('version' in data) {
            delete data.version;
        }

        // deserialize the user data into the User document we just created
        this.get('rest.manager').deserialize(user, data);

        // validate the (new) data inside the user object
        var errors = this.get('validator').validate(user);
        if (errors && errors.length !== 0) {
            throw this.createValidationError(errors, 'Invalid User Data Provided');
        }

        // return the hydrated user
        return user;
    },

    /**
     * Create a new User for a request, performs rest deserialization and validation
     * @param {Object} data The data to create the user with (the request body)
     * @param {Manager} [manager] The bass manager if you already have one
     * @returns {Promise}
     */
    createUserForRequest: function createUserForRequest(data, manager) {
        var self = this,
            deferred = Q.defer();

        this.ensureManager(manager).then(function(ensure) {

            // create a new empty User document
            var user = ensure.manager.createDocument('User');

            // prepare the new document for the request
            Q.fcall(self.prepareUserForRequest.bind(self, user, data)).then(function(user) {

                // save the new user object
                self.createUser(user, ensure.manager)
                    .then(deferred.resolve)
                    .fail(deferred.reject);

            }, deferred.reject);

        }).fail(deferred.reject);

        return deferred.promise;
    },

    /**
     * Update a user by id for a request, performs rest deserialization and validation
     * @param {string|number} userId The user id to update
     * @param {Object} data The data to update with
     * @param {Manager} [manager] The bass manager if you already have one
     * @returns {Promise}
     */
    updateUserForRequest: function updateUserForRequest(userId, data, manager) {
        var self = this,
            deferred = Q.defer();

        this.ensureManager(manager).then(function (ensure) {
            self.getUserById(userId, ensure.manager).then(function (user) {
                // make sure we have a user
                if (!user) {
                    deferred.reject(self.createNotFoundError('Could not find user by id, ' + userId));
                    return;
                }

                // prepare the user document for the request
                Q.fcall(self.prepareUserForRequest.bind(self, user, data)).then(function (user) {

                    // update the document
                    self.updateUser(user, ensure.manager)
                        .then(deferred.resolve)
                        .fail(deferred.reject);

                }, deferred.reject);

            }).fail(deferred.reject);
        }).fail(deferred.reject);

        return deferred.promise;
    },

    /**
     * Create a new user (does not perform validation)
     * @param {User} user The User document to create
     * @param {Manager} [manager] The bass manager if you already have one
     * @returns {Promise}
     */
    createUser: function createUser(user, manager) {
        var self = this,
            deferred = Q.defer();

        // encrypt the password before we save the document
        this.encryptUserPassword(user);

        this.ensureManager(manager).then(function (ensure) {

            // see if the user exists by email address
            self.getUsersByCriteria({email: user.email}, ensure.manager).then(function(users) {
                // if the user already exists, don't continue
                if (users && users.length !== 0) {
                    deferred.reject(self.createConflictError('Email address already exists: "' + user.email + '".'));
                    return;
                }

                // save the new User document
                ensure.manager.persist(user);
                ensure.manager.flush(user).then(function () {
                    // success, resolve with the new User document
                    deferred.resolve(user);
                }).fail(deferred.reject);
            });

        }).fail(deferred.reject);

        return deferred.promise;
    },

    /**
     * Update a user (does not perform validation)
     * @param {User} user The User document to update
     * @param {Manager} [manager] The bass manager if you already have one
     * @returns {Promise}
     */
    updateUser: function updateUser(user, manager) {
        var deferred = Q.defer();

        this.ensureManager(manager).then(function (ensure) {

            // save the new User document
            ensure.manager.persist(user);
            ensure.manager.flush(user).then(function () {
                // success, resolve with the User document
                deferred.resolve(user);
            }).fail(deferred.reject);

        }).fail(deferred.reject);

        return deferred.promise;
    },

    /**
     * Delete a user by id
     * @param {string|number} userId The user id to delete
     * @param {Manager} [manager] The bass manager if you already have one
     * @returns {Promise}
     */
    deleteUserById: function deleteUserById(userId, manager) {
        var self = this,
            deferred = Q.defer();

        this.ensureManager(manager).then(function(ensure) {

            // fetch the user
            self.getUserById(userId).then(function(user) {
                // make sure we found a user
                if (!user) {
                    deferred.reject(self.createNotFoundError('Could not find user by id, ' + userId));
                    return;
                }

                // remove the user
                ensure.manager.remove(user);
                ensure.manager.flush(user).then(function() {
                    // success
                    deferred.resolve();
                }).fail(deferred.reject);
            });

        }).fail(deferred.reject);

        return deferred.promise;
    },

    /**
     * Encrypt a user password
     * @param {string} password The password to encrypt
     * @param {string} salt The salt stored with the user, used for encryption
     * @returns {string}
     */
    encryptPassword: function encryptPassword(password, salt) {
        return crypto.createCipher('blowfish', password + salt).final('hex');
    },

    /**
     * Generate a unique salt for a user password
     * @returns {string}
     */
    generatePasswordSalt: function generatePasswordSalt() {
        var rand = Math.floor(Math.random() * 10000);
        return crypto.createHash('sha1').update(Date.now().toString() + rand).digest('hex');
    },

    /**
     * Encrypt a password for a User document
     * @param {User} user The User document
     * @param {string} [password] The plain text password to encrypt, if not provided, user.password is used
     * @returns {UserController} self
     */
    encryptUserPassword: function encryptUserPassword(user, password) {
        user.salt = this.generatePasswordSalt();
        user.password = this.encryptPassword(password || user.password, user.salt);
        return this;
    },

    /**
     * See if a given plain-text password is a valid password for the given User document
     * @param {User} user The User document
     * @param {string} password The password to check
     * @returns {boolean}
     */
    isUserPassword: function isUserPassword(user, password) {
        return user.password === this.encryptPassword(password, user.salt);
    }
});

module.exports = UserService;
