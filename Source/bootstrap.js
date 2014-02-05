/**
 * bootstraps angular onto the window.document node
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