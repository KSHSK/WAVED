/*global define*/
define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var DataSet = function(state) {
        state = defined(state) ? state : {};
        this._name = state.displayName; // String
        this._filename = state.filename; // String
        this._data = undefined; // TODO: Load data here, Object
        this._referenceCount = state.referenceCount; // Number

        ko.track(this);
    };

    DataSet.prototype.incrementReferenceCount = function() {
        // TODO
    };

    DataSet.prototype.decrementReferenceCount = function() {
        // TODO
    };

    Object.defineProperties(DataSet.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                this._name = value;
            }
        },
        filename : {
            get: function() {
                return this._filename;
            },
            set: function(value) {
                this._filename = value;
            }
        },
        data: {
            get: function() {
                return this._data;
            }
        },
        referenceCount: {
            get: function() {
                return this._referenceCount;
            }
        }
    });

    return DataSet;
});