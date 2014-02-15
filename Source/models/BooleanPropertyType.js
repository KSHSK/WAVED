/*global define*/
define([],function(){
    'use strict';

    var BooleanPropertyType = function(name){
        this._template = '<div>' +
            '<div>' + name + '</div>' +
    // '<input type="text" ng-model="' + name.replace(' ', '') + '"></input>' +
            '</div>';
    };

    Object.defineProperties(BooleanPropertyType.prototype, {
        template: {
            get: function() {
                return this._template;
            }
        }
    });

    return BooleanPropertyType;
});