/*global define*/
define([],function(){
    'use strict';

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