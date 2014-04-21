/*global require*/
require.config({
    paths: {
        jquery: '../ThirdParty/jquery/js/jquery-1.10.2',
        jqueryUI: '../ThirdParty/jquery/js/jquery-ui-1.10.4.custom.min',
        knockout: '../ThirdParty/knockout/knockout',
        infuser: '../ThirdParty/knockout/koExternalTemplateEngine/infuser-amd',
        TrafficCop: '../ThirdParty/knockout/koExternalTemplateEngine/TrafficCop',
        koExternalTemplateEngine: '../ThirdParty/knockout/koExternalTemplateEngine/koExternalTemplateEngine-amd',
        d3: '../ThirdParty/d3/d3.v3',
        DataTables: '../ThirdParty/DataTables/js/jquery.dataTables.min',
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
        'DataTables': {
          deps: ['jquery']
        },
        'koExternalTemplateEngine': {
            deps: ['jquery', 'infuser', 'TrafficCop', 'knockout']
        },
        'd3': {
            'exports': 'd3'
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
    infuser.defaults.loadingTemplate.content = '';
});
