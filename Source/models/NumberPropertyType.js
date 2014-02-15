/*global define*/
define([],function(){
    'use strict';

    var NumberPropertyType = {};

    Object.defineProperties(NumberPropertyType, {
        template: {
            get: function() {
                var content = '<div id="numberPropertyTemplate"><span data-bind="text:$data.displayName"></span>' +
                '<input type="text" data-bind="value:$data.value"></input></div>';
                return 'numberPropertyTemplate';
            }
        }
    });

    return NumberPropertyType;
});