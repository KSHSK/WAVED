/*global require*/
require.config({
    paths: {
        angular: '../ThirdParty/angularjs/angular.min',
        jquery: '../ThirdParty/jquery-ui-1.10.4.custom/js/jquery-1.10.2',
        jqueryUI: '../ThirdParty/jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.min'
    },

    shim: {
        'jqueryUI': {
            'exports': '$',
            deps: ['jquery']
        },
        'angular': {
            'exports': 'angular',
            deps: ['jquery']
        }
    },

    // Load bootstrap.js to start the application.
    deps: ['./bootstrap']
});