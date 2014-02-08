/**
 * Wraps the definition of the top-level app module.
 * Loads submodule dependencies.
 */
define([
    'angular',
    './controllers/index'
], function (ng) {

    return ng.module('app', [
        'app.controllers'
    ]);
});