/*global define*/
define([],function(){
    'use strict';

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