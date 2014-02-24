/*global define*/
define(['WAVEDViewModel',
        'knockout',
        'jquery'
    ], function(
        WAVEDViewModel,
        ko,
        $) {
    'use strict';

    var _container = document.body;
    var _started = false;
    var viewModel = new WAVEDViewModel();

    // Confirm if the user wants to leave when they have unsaved changes.
    $(window).on('beforeunload', function(event) {
        if (viewModel.dirty) {
            var message = 'You have unsaved changes.';

            // IE/Firefox
            event.returnValue = message;

            // Webkit browsers.
            return message;
        }
    });

    /* ### WAVED Definition ### */
    var WAVED = {

        start: function() {
            // Can only be called once.
            if (_started === false) {
                _started = true;
            }
        },

        viewModel: viewModel
    };

    return WAVED;
});