define([
        'toastr',
        'models/Constants/MessageType'
    ], function(
        toastr,
        MessageType
    ) {
    'use strict';

    toastr.options = {
        'closeButton': true,
        'showMethod': 'fadeIn',
        'hideMethod': 'fadeOut'
    };

    var displayMessage = function(message, type) {
        if (type === MessageType.SUCCESS) {
            toastr.options.timeOut = '2000';
            toastr.success(message);
        } else if (type === MessageType.ERROR) {
            toastr.options.timeOut = '0';
            toastr.error(message);
        } else if (type === MessageType.WARNING) {
            toastr.options.timeOut = '0';
            toastr.warning(message);
        } else if (type === MessageType.INFO) {
            toastr.options.timeOut = '5000';
            toastr.info(message);
        } else {
            toastr.options.timeOut = '2000';
            toastr.info(message);
        }
    };

    return displayMessage;
});