/*global define*/
define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var ComponentRecord = function(state) {
        state = defined(state) ? state : {};
        this._displayName = state.displayName;

        /* TODO */
       this._widget = undefined;

        ko.track(this);
    };

    Object.defineProperties(ComponentRecord.prototype, {
        displayName: {
            get: function() {
                return this._displayName;
            }
        },
        widget : {
            get: function() {
                return this._widget;
            }
        }
    });

    return ComponentRecord;
});