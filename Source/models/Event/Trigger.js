define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var Trigger = function(name, domElement) {

        this._name = name; // String
        this._domElement = domElement;

        // TODO: Do we still need this?
        ko.track(this);
    };

    Object.defineProperties(Trigger.prototype, {
        name: {
            get: function() {
                return this._name;
            }
        },
        domElement: {
            get: function() {
                return this._domElement;
            }
        }
    });

    return Trigger;
});