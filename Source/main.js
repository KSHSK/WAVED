/*global require*/
require.config({
    paths: {
        jquery: '../ThirdParty/jquery/js/jquery-1.10.2',
        jqueryUI: '../ThirdParty/jquery/js/jquery-ui-1.10.4.custom.min',
        knockout: '../ThirdParty/knockout/knockout',
        d3: '../ThirdParty/d3/d3.v3'
    },

    shim: {
        'jqueryUI': {
            'exports': '$',
            deps: ['jquery']
        },
        'd3': {
            'exports': 'd3'
        }
    },

    // Load bootstrap.js to start the application.
    deps: ['./bootstrap']
});