/*global require*/
require.config({
    paths: {
        jquery: '../ThirdParty/jquery/js/jquery-1.10.2',
        jqueryUI: '../ThirdParty/jquery/js/jquery-ui-1.10.4.custom.min',
        knockout: '../ThirdParty/knockout/knockout',
        koExternalTemplateEngine: '../ThirdParty/knockout/koExternalTemplateEngine/koExternalTemplateEngine_all'
    },

    shim: {
        'jqueryUI': {
            'exports': '$',
            deps: ['jquery']
        },
        'koExternalTemplateEngine': {
            deps: ['jquery', 'knockout']
        }
    },

    // Load bootstrap.js to start the application.
    deps: ['./bootstrap']
});