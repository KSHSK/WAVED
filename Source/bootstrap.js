/**
 * Bootstraps Angular onto the window.document node
 * http://www.startersquad.com/blog/angularjs-requirejs/
 */
 define([
    'require',
    'angular',
    'app'
 ], function (require, ng) {
    require(['../ThirdParty/domReady!'], function (document) {
        ng.bootstrap(document, ['app']);
    });
 });