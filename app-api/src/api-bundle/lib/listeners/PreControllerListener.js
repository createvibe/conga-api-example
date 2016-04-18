'use strict';

/**
 * Format bytes to string
 * @param {number} bytes Bytes to format
 * @param {number} [decimals] Decimal places
 * @returns {string}
 */
function formatBytes(bytes, decimals) {
    if (!bytes) {
        return '0 Byte';
    }
    var k = 1000; // or 1024 for binary
    var dm = decimals + 1 || 3;
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + formatBytes.sizes[i];
}
formatBytes.sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

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
        var mem,
            req = event.request,
            str = req.protocol + '://' + req.get('host') + req.originalUrl,
            env = event.container.getParameter('kernel.environment');

        if (env === 'development') {
            mem = process.memoryUsage();
            str = '[' + formatBytes(mem.heapUsed) + '] ' + str;
        }

        // debug access log
        event.container.get('logger').debug(str);

        next();
    }

};

PreControllerListener.prototype.constructor = PreControllerListener;

module.exports = PreControllerListener;