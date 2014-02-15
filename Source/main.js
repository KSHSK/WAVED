/*global require*/
require.config({
    paths: {
        jquery: '../ThirdParty/jquery/require-jquery',
        knockout: '../ThirdParty/knockout/knockout'
    },

    // Load bootstrap.js to start the application.
    deps: ['./bootstrap']
});