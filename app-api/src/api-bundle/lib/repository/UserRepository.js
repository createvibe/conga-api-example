'use script';

// local libs
var AbstractRepository = require('./AbstractRepository');

/**
 * The UserRepository has common queries for User documents
 * @constructor
 */
function UserRepository() {
    AbstractRepository.apply(this, arguments);
}

Conga.inherits(UserRepository, AbstractRepository, {

    // nothing here yet

});

module.exports = UserRepository;