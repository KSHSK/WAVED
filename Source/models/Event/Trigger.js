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
    var Trigger = function(domElement) {

        this._domElement = domElement;
        this._data = {};

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
            }
        }
    });

    Trigger.prototype.addData = function(name, key, value) {
        if (arguments.length === 2) {
            if (!defined(this._data.trigger)) {
                this._data.trigger = {};
            }
            this._data.trigger[name] = key;
            return;
        }

        if (!defined(this._data[name])) {
            this._data[name] = {};
        }
        this._data[name][key] = value;
    };

    return Trigger;
});