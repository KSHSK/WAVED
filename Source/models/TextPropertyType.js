/*global define*/
define([],function(){
    'use strict';

    var TextPropertyType = {};

    Object.defineProperties(TextPropertyType, {
        template: {
            get: function() {
                var content = '<div id="textPropertyTemplate"><span data-bind="text:displayName"></span>' +
                '<input type="text" data-bind="value:value"></input></div>';
                return content;
            }
        }
    });

    return TextPropertyType;
});