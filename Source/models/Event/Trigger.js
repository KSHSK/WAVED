define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    /**
     * @param {String} name
     * @param {function} getDomElement
     */
    var Trigger = function(domElement, data) {

        this._domElement = domElement;
        this._data = data;

        // TODO: Do we still need this?
        ko.track(this);
    };

    Object.defineProperties(Trigger.prototype, {
        domElement: {
            get: function() {
                return this._domElement;
            },
            set: function(value) {
                this._domElement = value;
            }
        },
        data: {
            get: function() {
                return this._data;
            },
            set: function(value) {
                this._data = value;
            }
        }
    });

    return Trigger;
});