'use strict';

// third party libs
var nodemailer = require('nodemailer');
var Q = require('q');

// local libs
var AbstractService = require('./AbstractService');

/**
 * The EmailService helps with sending emails from twig templates
 * @extends AbstractService
 * @constructor
 */
function EmailService() {
    AbstractService.apply(this, arguments);

    this.transport = nodemailer.createTransport(
        this.getParameter('email.transport.type'),
        {
            service: this.getParameter('email.transport.config.service'),
            auth: {
                user: this.getParameter('email.transport.config.auth.user'),
                pass: this.getParameter('email.transport.config.auth.pass')
            }
        }
    );
}

// EmailService extends AbstractService
Conga.inherits(EmailService, AbstractService, {
    /**
     * The nodemailer transport
     * @type {Object}
     */
    transport: null,

    /**
     * Render an email template
     * @param {string} template The template path
     * @param {Object} context The data to render the template with
     * @returns {Promise}
     */
    renderEmailTemplate: function renderEmailTemplate(template, context) {
        var deferred = Q.defer();

        try {
            this.get('twig').twig({
                path: template,
                async: true,
                rethrow: false,
                load: function (template) {
                    deferred.resolve(template.render(context));
                },
                error: function (err) {
                    deferred.reject(err);
                }
            });
        } catch (e) {
            deferred.reject(e);
        }

        return deferred.promise;
    },

    /**
     * Send an email
     * @param {Object} options Object containing at least "to", "subject", "template" to send the email
     * @returns {Promise}
     */
    sendEmail: function sendEmail(options) {
        var self = this,
            deferred = Q.defer();

        // validate the options
        if (!(options instanceof Object)) {
            deferred.reject(self.createInvalidArgumentError('Expecting options to be an object.'));
            return deferred.promise;
        }
        if (!options.to) {
            deferred.reject(self.createInvalidArgumentError('Expecting the "to" property to be set on options.'));
            return deferred.promise;
        }
        if (!options.subject) {
            deferred.reject(self.createInvalidArgumentError('Expecting the "subject" property to be set on options.'));
            return deferred.promise;
        }
        if (!options.template) {
            deferred.reject(self.createInvalidArgumentError('Expecting the "template" property to be set on options.'));
            return deferred.promise;
        }
        if (!options.from) {
            options.from = self.getParameter('email.from');
        }

        // render the email template with the context object
        self.renderEmailTemplate(options.template, options.context || {}).then(function(html) {

            // send the email after the template is rendered
            self.transport.sendMail({
                from: options.from,
                to: options.to,
                subject: options.subject,
                html: html
            }, function(err, response) {
                if (err) {
                    // reject with an error
                    deferred.reject(err);
                } else {
                    // resolve with the mailer response
                    deferred.resolve(response);
                }
            });

        }).fail(deferred.reject);

        return deferred.promise;
    }
});

module.exports = EmailService;