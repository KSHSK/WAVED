/*global define*/
define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    // Constant for marked for deletion.
    var MARKED_FOR_DELETION = -1;

    var DataSet = function(state) {
        state = defined(state) ? state : {};
        this._name = state.name; // String
        this._filename = state.filename; // String
        this._data = state.data; // Object
        this._referenceCount = state.referenceCount; // Number

        ko.track(this);
    };

    DataSet.prototype.incrementReferenceCount = function() {
        // Don't change if marked for deletion.
        if (this._referenceCount !== MARKED_FOR_DELETION) {
            this._referenceCount++;
        }
    };

    DataSet.prototype.decrementReferenceCount = function() {
        // Don't change if marked for deletion. Don't decrement below 0.
        if (this._referenceCount !== MARKED_FOR_DELETION && this._referenceCount > 0) {
            this._referenceCount--;
        }
    };

    DataSet.prototype.isMarkedForDeletion = function() {
        return (this._referenceCount === MARKED_FOR_DELETION);
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
        filename: {
            get: function() {
                return this._filename;
            },
            set: function(value) {
                this._filename = value;
            }
        },
        filenameOnly: {
            get: function() {
                return this._filename.substr(this._filename.lastIndexOf('/')+1, this._filename.length);
            },
        },
        data: {
            get: function() {
                return this._data;
            },
            set: function(data) {
                if (typeof data === 'object') {
                    this._data = data;
                }
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