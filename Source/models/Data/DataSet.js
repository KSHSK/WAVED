define(['knockout',
        'models/Property/StringProperty',
        'modules/ReadData',
        'modules/UniqueTracker',
        'util/defined',
        'util/createValidator'
    ],function(
        ko,
        StringProperty,
        ReadData,
        UniqueTracker,
        defined,
        createValidator){
    'use strict';

    // Constant for marked for deletion.
    var MARKED_FOR_DELETION = -1;

    var DataSet = function(state) {
        state = defined(state) ? state : {};

        this._name = '';
        this._filename = '';
        this._referenceCount = 0;

        this.setState(state);

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    DataSet.getType = function() {
        return 'DataSet';
    };

    DataSet.getUniqueNameNamespace = function() {
        return 'dataset-name';
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

    DataSet.prototype.markForDeletion = function() {
        this._referenceCount = MARKED_FOR_DELETION;
    };

    DataSet.prototype.isMarkedForDeletion = function() {
        return (this._referenceCount === MARKED_FOR_DELETION);
    };

    DataSet.prototype.getState = function() {
        return {
            type: DataSet.getType(),
            name: this.name,
            filename: this.filename,
            referenceCount: this.referenceCount
        };
    };

    DataSet.prototype.setState = function(state) {
        if (defined(state.name)) {
            this.name = state.name;
        }

        if (defined(state.referenceCount)) {
            this._referenceCount = state.referenceCount;
        }

        if (defined(state.filename)) {
            this._filename = state.filename;

            if (!this.isMarkedForDeletion()) {
                ReadData.readData(this);
            }
        }
    };

    Object.defineProperties(DataSet.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                var success = UniqueTracker.addValueIfUnique(DataSet.getUniqueNameNamespace(), value, this);
                if (success) {
                    this._name = value;
                }
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