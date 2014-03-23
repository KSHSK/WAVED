define(['knockout',
        'models/Property/StringProperty',
        'modules/ReadData',
        'modules/UniqueTracker',
        'util/defined',
        'util/createValidator',
        'util/subscribeObservable',
        'd3',
        'jquery'
    ],function(
        ko,
        StringProperty,
        ReadData,
        UniqueTracker,
        defined,
        createValidator,
        subscribeObservable,
        d3,
        $
    ){
    'use strict';

    // Constant for marked for deletion.
    var MARKED_FOR_DELETION = -1;

    var DataSet = function(state) {
        state = defined(state) ? state : {};

        this._name = '';
        this._filename = '';
        this._referenceCount = 0;
        this._dataFields = [];

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

    DataSet.prototype.resetReferenceCount = function() {
        // Can only be used when the DataSet is marked for deletion.
        if (this._referenceCount === MARKED_FOR_DELETION) {
            this._referenceCount = 0;
        }
    };

    DataSet.prototype.isMarkedForDeletion = function() {
        return (this._referenceCount === MARKED_FOR_DELETION);
    };

    DataSet.prototype.getNameAndFilename = function() {
        return this._name + ' : ' + this._filename;
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
        var self = this;
        if (defined(state.name)) {
            this._name = state.name;
        }

        if (defined(state.referenceCount)) {
            this._referenceCount = state.referenceCount;
        }

        if (defined(state.filename)) {
            this._filename = state.filename;

            if (!this.isMarkedForDeletion()) {
                // Populate the dataFields array once readData() is done
                $.when(ReadData.readData(this)).done(function(){
                    var values = d3.values(self._data)[0];
                    if(defined(values)){
                        self._dataFields = Object.keys(values);
                    }
                });
            }
        }
    };

    DataSet.prototype.subscriptions = [];

    DataSet.prototype.subscribed = false;

    DataSet.prototype.subscribeChanges = function(setDirty) {
        var self = this;

        var properties = [];
        for (var prop in this) {
            if (this.hasOwnProperty(prop)) {
                if(prop !== '_data' && prop !== '_dataFields'){
                    properties.push(prop);
                }
            }
        }

        properties.forEach(function(prop) {
            var subscription = subscribeObservable(self, prop, setDirty);

            if(subscription !== null){
                self.subscriptions.push(subscription);
            }
        });

        this.subscribed = true;
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
        },
        dataFields: {
            get: function() {
                return this._dataFields;
            },
            set: function(fields){
                this._dataFields = fields;
            }
        }
    });

    return DataSet;
});