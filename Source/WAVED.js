/*global define*/
define(['WAVEDViewModel',
        'knockout',
        'knockoutValidation',
        'jquery'
    ], function(
        WAVEDViewModel,
        ko,
        koV,
        $) {
    'use strict';

    ko.validation.configure({
        registerExtenders: true,
        messagesOnModified: true,
        insertMessages: true,
        parseInputAttributes: true
    });

    var viewModel = new WAVEDViewModel();

    // Confirm if the user wants to leave when they have unsaved changes.
    $(window).on('beforeunload', function(event) {
        if (viewModel.dirty === true) {
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