/*global define*/
define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var ComponentRecord = function(record) {
        record = defined(record) ? record : {};
        this._displayName = record.displayName;

        /* TODO */
        this._widget = undefined; // Object

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