/*global define*/
define(['WAVEDViewModel',
        'knockout',
        'jquery'
    ], function(
        WAVEDViewModel,
        ko,
        $) {
    'use strict';

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
        viewModel: viewModel
    };

    return WAVED;
});