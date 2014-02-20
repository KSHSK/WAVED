/*global define*/
define([],function(){
    'use strict';
    /*TODO: Refactor*/
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