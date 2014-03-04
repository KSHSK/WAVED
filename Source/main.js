/*global require*/
require.config({
    paths: {
        jquery: '../ThirdParty/jquery/js/jquery-1.10.2',
        jqueryUI: '../ThirdParty/jquery/js/jquery-ui-1.10.4.custom.min',
        knockout: '../ThirdParty/knockout/knockout',
        infuser: '../ThirdParty/knockout/koExternalTemplateEngine/infuser-amd',
        TrafficCop: '../ThirdParty/knockout/koExternalTemplateEngine/TrafficCop',
        koExternalTemplateEngine: '../ThirdParty/knockout/koExternalTemplateEngine/koExternalTemplateEngine-amd'
    },

    shim: {
        'jqueryUI': {
            'exports': '$',
            deps: ['jquery']
        },
        'TrafficCop': {
          deps: ['jquery']
        },
        'infuser': {
          deps: ['jquery']
        },
        'koExternalTemplateEngine': {
            deps: ['jquery', 'infuser', 'TrafficCop', 'knockout']
        },
        'knockout': {
            deps: ['../ThirdParty/knockout/weakmap']
        }
    },

    // Load bootstrap.js to start the application.
    deps: ['./bootstrap']
});

// Set the infuser properties for templating
require(['infuser'], function(infuser){
   'use strict';

    infuser.defaults.templateUrl = 'Source/templates/';
    infuser.defaults.templatePrefix = '';
    infuser.defaults.templateSuffix = '.html';
});