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
				subject: self.getParameter('email.template.welcome.subject'),
				template: self.getParameter('email.template.welcome'),
				context: {user: user}
			}).fail(console.error);

			// success callback, return the user object
			res.return(user);

		}).fail(errorCallback);
	},

	/**
	 * @Route("/:id", name="user.get", methods=["GET"])
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
	 * @Route("/:id", name="user.update", methods=["PUT"])
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
     */
	deleteUser: function(req, res) {
		var userId = req.params.id;

		// create a callback for error responses
		var errorCallback = this.createErrorCallback(res, 'Unable to delete user');

		this.get('user.service').deleteUserById(userId).then(function() {

			// success callback
			res.OK();

		}).fail(errorCallback);
	},

	/**
	 * @Route("/login", name="user.login", methods=["POST"])
	 */
	loginUser: function(req, res) {
		var email = req.body.email;
		var password = req.body.password;
		var userService = this.get('user.service');
		var accessDeniedError = this.createAccessDeniedError('Email or password is invalid.');

		// create a callback for error responses
		var errorCallback = this.createErrorCallback(res, 'Unable to login');

		userService.getOneUserByCriteria({email: email}).then(function (user) {
			if (!user) {
				// invalid email
				errorCallback(accessDeniedError);
				return;
			}
			if (!userService.isUserPassword(user, password)) {
				// invalid password
				errorCallback(accessDeniedError);
				return;
			}
			// return the user
			res.return(user);
		}).fail(errorCallback);
	}
});

module.exports = UserController;