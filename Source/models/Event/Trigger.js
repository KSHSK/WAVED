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
    var Trigger = function(name, getDomElement) {

        this._name = name;
        this._getDomElement = getDomElement;

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
                return this._getDomElement();
            }
        }
    });

    return Trigger;
});