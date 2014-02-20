/*global define*/
define([],function(){
    'use strict';
    /*TODO: Refactor*/
    var EnumPropertyType = {};

    Object.defineProperties(EnumPropertyType, {
        template: {
            get: function() {
                return 'enumPropertyTemplate';
            }
        }
    });

    return EnumPropertyType;
});