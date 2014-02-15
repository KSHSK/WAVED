/*global define*/
define([],function(){
    'use strict';

    var EnumPropertyType = function(name){
        this._template = '<div>' +
            '<div>' + name + '</div>' +
            '<input type="text" ng-model="' + name.replace(' ', '') + '"></input>' +
            '</div>';
    };

    Object.defineProperties(EnumPropertyType.prototype, {
        template: {
            get: function() {
                return this._template;
            }
        }
    });

    return EnumPropertyType;
});