define(['WAVEDViewModel',
        'models/Data/DataSet',
        'knockout',
        'jquery'
    ], function(
        WAVEDViewModel,
        DataSet,
        ko,
        $) {
    'use strict';

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

    //used for setState
    var wavedTypes = {};
    wavedTypes[DataSet.getType()] = DataSet;
    window.wavedTypes = wavedTypes;

    /* ### WAVED Definition ### */
    var WAVED = {
        viewModel: viewModel
    };

    return WAVED;
});