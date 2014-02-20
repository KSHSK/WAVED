/*global define*/
define([],function(){
    'use strict';
    /*TODO: Refactor*/
    var NumberPropertyType = {};

    Object.defineProperties(NumberPropertyType, {
        template: {
            get: function() {
                return 'numberPropertyTemplate';
            }
        }
    });

    return NumberPropertyType;
});