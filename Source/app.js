/*global define*/
/**
 * Wraps the definition of the top-level app module. Loads submodule dependencies.
 */
define(['angular', './controllers/index'], function(ng) {
    'use strict';

    return ng.module('app', ['app.controllers']);
});