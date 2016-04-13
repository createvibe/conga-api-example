'use strict';

// local libs
var AbstractController = require('./AbstractController');

/**
 * @Route("/users")
 *
 * @extends AbstractController
 * @constructor
 */
function UserController() {
	AbstractController.apply(this, arguments);
}

// UserController extends AbstractController
Conga.inherits(UserController, AbstractController, {
	/**
	 * @Route("/", name="user.create", methods=["POST"])
	 */
	createUser: function(req, res) {
		var self = this;

		// create a callback for error responses
		var errorCallback = this.createErrorCallback(res, 'Unable to create user.');

		// create a new user with the user service - req.body is the HTTP POST body
		this.get('user.service').createUserForRequest(req.body).then(function (user) {

			// send a welcome email (background operation)
			self.get('email.service').sendEmail({
				to: user.email,
				subject: 'Welcome To BloomNation!',
				template: 'api-bundle:email/user-welcome',
				context: {user: user}
			}).fail(console.error);

			// success callback, return the user object
			res.return(user);

		}).fail(errorCallback);
	},

	/**
	 * @Route("/:id", name="user.get", methods=["GET"])
	 * @Security(roles=["USER"])
	 */
	getUser: function(req, res) {
		var self = this,
			userId = req.params.id;

		// create a callback for error responses
		var errorCallback = this.createErrorCallback(res, 'Unable to fetch user');

		// get the user by id from the user service
		this.get('user.service').getUserById(userId).then(function(user) {
			// success callback
			if (!user) {
				errorCallback(self.createNotFoundError('Could not find user by id ' + userId));
				return;
			}
			res.return(user);
		}).fail(errorCallback);
	},

	/**
	 * @Route("/:id", name="user.update", methods=["POST","PUT"])
	 * @Security(roles=["USER"])
     */
	updateUser: function(req, res) {
		var userId = req.params.id;

		// create a callback for error responses
		var errorCallback = this.createErrorCallback(res, 'Unable to update user with id ' + userId);

		// get the user by id from the user service
		this.get('user.service').updateUserForRequest(userId, req.body).then(function (user) {

			// success callback
			res.return(user);

		}).fail(errorCallback);
	},

	/**
	 * @Route("/:id", name="user.delete", methods=["DELETE"])
	 * @Security(roles=["ADMIN"])
     */
	deleteUser: function(req, res) {
		var userId = req.params.id;

		// create a callback for error responses
		var errorCallback = this.createErrorCallback(res, 'Unable to delete user');

		this.get('user.service').deleteUserById(userId).then(function() {

			// success callback
			res.OK();

		}).fail(errorCallback);
	}
});

module.exports = UserController;