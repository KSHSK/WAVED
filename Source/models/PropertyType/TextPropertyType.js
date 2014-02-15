/*global define*/
define([],function(){
    'use strict';

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