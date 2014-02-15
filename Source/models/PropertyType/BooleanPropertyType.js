/*global define*/
define([],function(){
    'use strict';

    var BooleanPropertyType = {};

    Object.defineProperties(BooleanPropertyType, {
        template: {
            get: function() {
                return 'booleanPropertyTemplate';
            }
        }
    });

    return BooleanPropertyType;
});