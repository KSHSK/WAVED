/*global define*/
define([],function(){
    'use strict';
    /*TODO: Refactor*/
    var TextPropertyType = {};

    Object.defineProperties(TextPropertyType, {
        template: {
            get: function() {
                return 'textPropertyTemplate';
            }
        }
    });

    return TextPropertyType;
});