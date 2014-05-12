define([
        'toastr',
        'models/Constants/MessageType'
    ], function(
        toastr,
        MessageType
    ) {
    'use strict';

    toastr.options = {
        'timeOut': '2000',
        'closeButton': true,
        'showMethod': 'fadeIn',
        'hideMethod': 'fadeOut'
    };

    var displayMessage = function(message, type) {
        if (type === MessageType.SUCCESS) {
            toastr.success(message);
        } else if (type === MessageType.ERROR) {
            toastr.options.timeOut = '0';
            toastr.error(message);
        } else if (type === MessageType.WARNING) {
            toastr.options.timeOut = '0';
            toastr.warning(message);
        } else {
            toastr.info(message);
        }
    };

    return displayMessage;
});