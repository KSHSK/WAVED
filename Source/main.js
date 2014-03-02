/*global require*/
require.config({
    paths: {
        jquery: '../ThirdParty/jquery/js/jquery-1.10.2',
        jqueryUI: '../ThirdParty/jquery/js/jquery-ui-1.10.4.custom.min',
        knockout: '../ThirdParty/knockout/knockout',
        knockoutValidation: '../ThirdParty/knockout/knockout.validation'
    },

    shim: {
        'jqueryUI': {
            'exports': '$',
            deps: ['jquery']
        },
        'knockoutValidation': {
            deps: ['knockout']
        }
    },

    // Load bootstrap.js to start the application.
    deps: ['./bootstrap']
});