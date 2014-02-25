/*global define*/
define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var Property = function(state) {
        state = defined(state) ? state : {};
        this._displayName = state.displayName;

        ko.track(this);
    };

    Object.defineProperties(Property.prototype, {
        displayName: {
            get: function() {
                return this._displayName;
            }
        },
        templateName : {
            get: function() {
                return this._templateName;
            }
        }
    });

    return Property;
});