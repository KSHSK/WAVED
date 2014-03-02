/*global require*/
require.config({
    paths: {
        jquery: '../ThirdParty/jquery/js/jquery-1.10.2',
        jqueryUI: '../ThirdParty/jquery/js/jquery-ui-1.10.4.custom.min',
        knockout: '../ThirdParty/knockout/knockout',
        d3: '../ThirdParty/d3/d3.v3.js'
    },

    shim: {
        'jqueryUI': {
            'exports': '$',
            deps: ['jquery']
        }
    },

    // Load bootstrap.js to start the application.
    deps: ['./bootstrap']
});