'use strict';

/**
 * The PreControllerListeners fires before controllers are executed
 * @constructor
 */
function PreControllerListener() {
    // empty
}

PreControllerListener.prototype = {

    /**
     * Respond to the pre-controller event
     * @param {Object} event The event object, contains request, response and container
     * @param {Function} next The callback MUST be called to continue execution of the events
     * @returns {void}
     */
    onPreController: function(event, next) {
        var req = event.request;

        // debug access log
        event.container.get('logger').debug(req.protocol + '://' + req.get('host') + req.originalUrl);

        next();
    }

};

PreControllerListener.prototype.constructor = PreControllerListener;

module.exports = PreControllerListener;